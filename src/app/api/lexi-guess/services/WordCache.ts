import { LexiGuessConfig } from '@/app/components/config';
import { WordCache as IWordCache, WordSource } from '../types';
import { get } from 'lodash';

interface CachedWord {
  word: string;
  source: WordSource;
}

export class WordCache implements IWordCache {
  private cache: Map<string, CachedWord> = new Map();
  private usedWords: Map<string, Set<string>> = new Map();

  private getCacheKey(config: LexiGuessConfig): string {
    return `${config.locale}-${config.maxWordLength}`;
  }

  private getUsedWordsKey(config: LexiGuessConfig): string {
    return `used-${config.locale}-${config.maxWordLength}`;
  }

  public getWord(config: LexiGuessConfig): string | null {
    const cached = this.cache.get(this.getCacheKey(config));
    return get(cached, 'word', null);
  }

  public setWord(config: LexiGuessConfig, word: string, source: WordSource): void {
    this.cache.set(this.getCacheKey(config), { word, source });
  }

  public async getDailyWord(config: LexiGuessConfig): Promise<{ word: string; source: WordSource }> {
    const cached = this.cache.get(this.getCacheKey(config));
    if (!cached) {
      throw new Error('Daily word not found in cache');
    }
    return cached;
  }

  public async getPracticeWord(config: LexiGuessConfig, cacheKey: string): Promise<{ word: string; source: WordSource }> {
    const cached = this.cache.get(cacheKey);
    if (!cached) {
      throw new Error('Practice word not found in cache');
    }
    return cached;
  }

  public getUsedWords(config: LexiGuessConfig): Set<string> {
    return get(this.usedWords, this.getUsedWordsKey(config), new Set<string>());
  }

  public addUsedWord(config: LexiGuessConfig, word: string): void {
    const key = this.getUsedWordsKey(config);
    if (!this.usedWords.has(key)) {
      this.usedWords.set(key, new Set());
    }
    this.usedWords.get(key)?.add(word);
  }

  public clearUsedWords(config: LexiGuessConfig): void {
    this.usedWords.delete(this.getUsedWordsKey(config));
  }
} 