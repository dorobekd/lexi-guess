import { LexiGuessConfig } from '@/app/components/config';
import { WordCache } from '../types';

interface CacheEntry {
  word: string;
  usedWords: Set<string>;
}

export class InMemoryWordRepository implements WordCache {
  private cache: Map<string, CacheEntry> = new Map();

  private getCacheKey(config: LexiGuessConfig): string {
    const allowedChars = config.keyboardRows.flat().join('');
    return `${config.locale}-${config.maxWordLength}-${config.gameMode}-${allowedChars}`;
  }

  private getDailyCacheKey(config: LexiGuessConfig): string {
    const today = new Date().toISOString().split('T')[0];
    return `daily-${config.locale}-${config.maxWordLength}-${today}`;
  }

  getWord(config: LexiGuessConfig): string | null {
    const key = this.getCacheKey(config);
    return this.cache.get(key)?.word || null;
  }

  setWord(config: LexiGuessConfig, word: string): void {
    const key = this.getCacheKey(config);
    const entry = this.cache.get(key) || { word: '', usedWords: new Set<string>() };
    entry.word = word;
    entry.usedWords.add(word);
    this.cache.set(key, entry);
  }

  async getDailyWord(config: LexiGuessConfig): Promise<string> {
    const key = this.getDailyCacheKey(config);
    const entry = this.cache.get(key);
    if (!entry?.word) {
      throw new Error('Daily word not set');
    }
    return entry.word;
  }

  async getPracticeWord(config: LexiGuessConfig, cacheKey: string): Promise<string> {
    const entry = this.cache.get(cacheKey);
    if (!entry?.word) {
      throw new Error('Practice word not set');
    }
    return entry.word;
  }

  getUsedWords(config: LexiGuessConfig): Set<string> {
    const key = this.getCacheKey(config);
    return this.cache.get(key)?.usedWords || new Set<string>();
  }

  addUsedWord(config: LexiGuessConfig, word: string): void {
    const key = this.getCacheKey(config);
    const entry = this.cache.get(key) || { word: '', usedWords: new Set<string>() };
    entry.usedWords.add(word);
    this.cache.set(key, entry);
  }

  clearUsedWords(config: LexiGuessConfig): void {
    const key = this.getCacheKey(config);
    const entry = this.cache.get(key);
    if (entry) {
      entry.usedWords = new Set<string>();
      this.cache.set(key, entry);
    }
  }
}

// Export singleton instance
export const wordRepository = new InMemoryWordRepository(); 