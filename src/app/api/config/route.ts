import { NextResponse } from 'next/server';
import { WordliConfig, DEFAULT_CONFIG } from '@/app/components/config';

// In a real app, this would be in a database
let currentConfig: WordliConfig = DEFAULT_CONFIG;

export async function GET() {
  return NextResponse.json(currentConfig);
}

export async function POST(request: Request) {
  try {
    const newConfig = await request.json();
    
    // Validate the config
    if (typeof newConfig.maxWordLength !== 'number' || newConfig.maxWordLength < 1) {
      return NextResponse.json(
        { error: 'Invalid maxWordLength' },
        { status: 400 }
      );
    }
    
    if (typeof newConfig.maxGuesses !== 'number' || newConfig.maxGuesses < 1) {
      return NextResponse.json(
        { error: 'Invalid maxGuesses' },
        { status: 400 }
      );
    }

    if (!['daily', 'practice', 'custom'].includes(newConfig.gameMode)) {
      return NextResponse.json(
        { error: 'Invalid gameMode' },
        { status: 400 }
      );
    }

    // Update the config
    currentConfig = newConfig;
    
    return NextResponse.json(currentConfig);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
} 