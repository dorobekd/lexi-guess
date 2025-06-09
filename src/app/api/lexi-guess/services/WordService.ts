import { LexiGuessConfig } from '@/app/components/config';
import { GuessResult } from '../types';
import { WordValidator } from './WordValidator';
import { OpenAIWordGenerator } from './OpenAIWordGenerator';
import { FallbackWordService } from './FallbackWordService';
import { withRequestContext } from '@/lib/logger';
import { randomUUID } from 'crypto';
import { CompositeWordGenerator } from './CompositeWordGenerator';

export class WordService {
  private wordGenerator: CompositeWordGenerator;
  private wordValidator: WordValidator;
  private wordCache: Map<string, { word: string; source: string }> = new Map();
  private gameConfigs: Map<string, LexiGuessConfig> = new Map();

  constructor() {
    this.wordGenerator = new CompositeWordGenerator(
      new OpenAIWordGenerator(),
      new FallbackWordService()
    );
    this.wordValidator = new WordValidator();
  }

  private generateGameId(): string {
    return randomUUID();
  }

  async initializeGame(config: LexiGuessConfig) {
    return withRequestContext({ service: 'WordService' }, async (logger) => {
      const result = await this.wordGenerator.generateWords(config);
      const word = result.words[0]; // Take first word
      const gameId = this.generateGameId();

      logger.info('🎮 Setting answer for game', { gameId, word, source: result.source });
      
      this.wordCache.set(gameId, { word, source: result.source });
      this.gameConfigs.set(gameId, config);
      
      return {
        gameId,
        source: result.source
      };
    });
  }

  async validateGuess(guess: string, gameId: string): Promise<GuessResult> {
    return withRequestContext({ service: 'WordService', gameId }, async (logger) => {
      const cached = this.wordCache.get(gameId);
      if (!cached) {
        throw new Error('Game not found');
      }

      logger.debug('🎯 Validating guess against answer', { gameId, guess, answer: cached.word });
      
      return this.wordValidator.validateGuess(guess, cached.word);
    });
  }
}

// Export singleton instance
export const wordService = new WordService(); 