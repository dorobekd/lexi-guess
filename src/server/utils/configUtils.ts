import { LexiGuessConfig } from '@/app/components/config';

/**
 * Generates a unique cache key based on the LexiGuess configuration.
 * @param config The LexiGuess configuration.
 * @returns A unique string key for caching.
 */
export function getCacheKey(config: LexiGuessConfig): string {
  const allowedChars = config.keyboardRows.flat().join('');
  return `${config.locale}-${config.maxWordLength}-${allowedChars}`;
}