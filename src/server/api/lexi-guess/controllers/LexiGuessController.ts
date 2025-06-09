import { NextResponse, NextRequest } from 'next/server';
import { LexiGuessConfig } from '@/app/components/config';
import { wordService } from '../services/WordService';
import { guessRateLimiter, initRateLimiter } from '../services/RateLimiterService';
import { z } from 'zod';

const configSchema = z.object({
  locale: z.enum(['EN', 'PL'] as const),
  maxWordLength: z.number().min(4).max(8),
  keyboardRows: z.array(z.array(z.string())),
  maxGuesses: z.number().min(1),
  gameMode: z.enum(['daily', 'practice'] as const)
});

const guessSchema = z.object({
  guess: z.string(),
  gameId: z.string(),
});

function validateConfig(config: unknown): config is LexiGuessConfig {
  try {
    console.log('Validating config:', config);
    configSchema.parse(config);
    console.log('Config validation successful');
    return true;
  } catch (error) {
    console.error('Config validation failed:', error);
    return false;
  }
}

function addRateLimitHeaders(response: NextResponse, headers: Record<string, string>): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function handleGet(request: NextRequest) {
  try {
    const { success, headers } = await initRateLimiter.checkLimit(request, 'init', 5);
    if (!success) {
      const response = NextResponse.json(
        { error: 'Too many initialization requests. Please try again later.' },
        { status: 429 }
      );
      return addRateLimitHeaders(response, headers);
    }

    const { searchParams } = new URL(request.url);
    const configStr = searchParams.get('config');
    if (!configStr) {
      return NextResponse.json({ error: 'Config parameter is required' }, { status: 400 });
    }

    let config: unknown;
    try {
      config = JSON.parse(configStr);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid config JSON',
        details: error instanceof Error ? error.message : 'JSON parse error'
      }, { status: 400 });
    }

    if (!validateConfig(config)) {
      return NextResponse.json({ 
        error: 'Invalid config structure',
        details: 'Config does not match required schema'
      }, { status: 400 });
    }

    const result = await wordService.initializeGame(config);
    const response = NextResponse.json(result);
    return addRateLimitHeaders(response, headers);

  } catch (error) {
    console.error('❌ Error in GET:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize game',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function handlePost(request: NextRequest) {
  try {
    const { success, headers } = await initRateLimiter.checkLimit(request, 'init', 5);
    if (!success) {
      const response = NextResponse.json(
        { error: 'Too many initialization requests. Please try again later.' },
        { status: 429 }
      );
      return addRateLimitHeaders(response, headers);
    }

    let config: unknown;
    try {
      config = await request.json();
      console.log('Received POST body:', config);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid JSON body',
        details: error instanceof Error ? error.message : 'JSON parse error'
      }, { status: 400 });
    }

    if (!validateConfig(config)) {
      return NextResponse.json({ 
        error: 'Invalid config structure',
        details: 'Config does not match required schema'
      }, { status: 400 });
    }

    const result = await wordService.initializeGame(config);
    const response = NextResponse.json(result);
    return addRateLimitHeaders(response, headers);

  } catch (error) {
    console.error('❌ Error in POST:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize game',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function handlePut(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
      console.log('Received guess request:', body);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid JSON body',
        details: error instanceof Error ? error.message : 'JSON parse error'
      }, { status: 400 });
    }
    
    try {
      const { guess, gameId } = guessSchema.parse(body);
      console.log('Parsed guess data:', { guess, gameId });

      // Rate limit check for guesses
      const { success, headers } = await guessRateLimiter.checkLimit(request, 'guess', 10);
      if (!success) {
        const response = NextResponse.json(
          { error: 'Too many guess attempts. Please try again later.' },
          { status: 429 }
        );
        return addRateLimitHeaders(response, headers);
      }
      console.log('Rate limit check passed');

      console.log('Validating guess');
      const result = await wordService.validateGuess(guess, gameId);
      console.log('Validation result:', result);

      const response = NextResponse.json(result);
      return addRateLimitHeaders(response, headers);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: 'Invalid request data',
          details: error.errors
        }, { status: 400 });
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('❌ Error in PUT:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate guess',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 