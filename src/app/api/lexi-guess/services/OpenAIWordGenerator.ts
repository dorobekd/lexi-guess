import { OpenAI } from 'openai';
import { LexiGuessConfig } from '@/app/components/config';
import { withRequestContext } from '@/lib/logger';
import { WordGenerator, GeneratedWords } from '../types';

export class OpenAIWordGenerator implements WordGenerator {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private generatePrompt(config: LexiGuessConfig): string {
    const language = config.locale === 'PL' ? 'Polish' : 'English';
    const allowedChars = config.keyboardRows.flat().join('');
    
    return `Generate a list of ${language} words that:
      1. Are exactly ${config.maxWordLength} letters long
      2. Only use these letters: ${allowedChars}
      3. Are common, well-known words
      4. Are separated by commas
      Return only the words, no explanations.`;
  }

  public async generateWords(config: LexiGuessConfig): Promise<GeneratedWords> {
    return withRequestContext({ service: 'OpenAIWordGenerator' }, async (logger) => {
      try {
        const prompt = this.generatePrompt(config);
        logger.debug('📤 Sending prompt to OpenAI', { prompt });

        const completion = await this.openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500,
        });

        const response = completion.choices[0].message.content || '';
        logger.debug('📥 Received OpenAI response', { response });

        const allowedChars = config.keyboardRows.flat().join('');
        logger.debug('🔤 Processing with allowed characters', { allowedChars });

        // Ensure response is a string and handle potential JSON responses
        let processedResponse = response;
        try {
          // Check if response is JSON
          const parsed = JSON.parse(response);
          if (Array.isArray(parsed)) {
            processedResponse = parsed.join(',');
          } else if (typeof parsed === 'object' && parsed.words) {
            processedResponse = Array.isArray(parsed.words) ? parsed.words.join(',') : String(parsed.words);
          } else {
            processedResponse = String(parsed);
          }
        } catch (error) {
          // Response is not JSON, use as is
          logger.debug('📝 Response is not JSON, using raw string', { 
            error: error instanceof Error ? { message: error.message } : error 
          });
        }

        logger.debug('🔄 Processed response', { processedResponse });

        // Split by common delimiters and clean up
        const words = processedResponse
          .split(/[\s,\n]+/)
          .map(word => word.trim().toUpperCase())
          .filter(word => 
            word.length === config.maxWordLength && 
            [...word].every(char => allowedChars.includes(char))
          );

        logger.debug('📝 Extracted words', { words });

        if (words.length === 0) {
          throw new Error('No valid words generated');
        }

        return {
          words,
          source: 'openai'
        };
      } catch (error) {
        logger.error('❌ Error generating words from OpenAI', {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error
        });
        throw new Error('Failed to generate words from OpenAI');
      }
    });
  }
} 