import { LexiGuessConfig } from '@/app/components/config';
import { WordGenerator, WordCache, WordValidator, GuessResult } from '../types';
import { CompositeWordGenerator } from './CompositeWordGenerator';
import { WordCache as WordCacheImpl } from './WordCache';
import { WordValidator as WordValidatorImpl } from './WordValidator';
import { OpenAIWordGenerator } from './OpenAIWordGenerator';
import { FallbackWordService } from './FallbackWordService';
import logger from '@/server/lib/logger';

export class WordService {
  private wordGenerator: WordGenerator;
  private wordCache: WordCache;
  private wordValidator: WordValidator;
  private gameConfigs: Map<string, LexiGuessConfig> = new Map();

  constructor() {
    this.wordGenerator = new CompositeWordGenerator(
      new OpenAIWordGenerator(),
      new FallbackWordService()
    );
    this.wordCache = new WordCacheImpl();
    this.wordValidator = new WordValidatorImpl();
  }

  public async initializeGame(config: LexiGuessConfig): Promise<{ gameId: string; source: string }> {
    const result = await this.wordGenerator.generateWords(config);
    const word = result.words[0];
    const gameId = this.generateGameId();

    logger.info('🎮 Setting answer for game', { gameId, word, source: result.source });
    
    this.wordCache.setWord(config, word, result.source);
    this.wordCache.clearUsedWords(config);
    this.wordCache.addUsedWord(config, word);
    this.gameConfigs.set(gameId, config);

    return {
      gameId,
      source: result.source
    };
  }

  public async validateGuess(guess: string, gameId: string): Promise<GuessResult> {
    const config = this.gameConfigs.get(gameId);
    if (!config) {
      throw new Error('Game not found');
    }

    const word = this.wordCache.getWord(config);
    if (!word) {
      throw new Error('Word not found for this game');
    }

    logger.debug('🎯 Validating guess against answer', { gameId, guess, answer: word });
    
    return this.wordValidator.validateGuess(guess, word);
  }

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const wordService = new WordService(); 