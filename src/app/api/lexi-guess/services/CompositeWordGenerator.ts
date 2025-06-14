import { LexiGuessConfig } from '@/app/components/config';
import { WordGenerator, GeneratedWords } from '../types';
import { OpenAIWordGenerator } from './OpenAIWordGenerator';
import { FallbackWordService } from './FallbackWordService';
import logger from '../../../lib/logger';

export class CompositeWordGenerator implements WordGenerator {
  constructor(
    private primaryGenerator: WordGenerator,
    private fallbackGenerator: WordGenerator
  ) {}

  public async generateWords(config: LexiGuessConfig): Promise<GeneratedWords> {
    try {
      return await this.primaryGenerator.generateWords(config);
    } catch (error) {
      logger.warn('⚠️ Primary generator failed, falling back to secondary generator', { 
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error 
      });
      return await this.fallbackGenerator.generateWords(config);
    }
  }
}

// Export singleton instance
export const wordGenerator = new CompositeWordGenerator(new OpenAIWordGenerator(), new FallbackWordService()); 