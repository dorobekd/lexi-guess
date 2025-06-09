import { LexiGuessConfig, Locale } from '@/app/components/config';
import { LETTER_STATUS } from '@/app/components/types';

export type WordSource = 'openai' | 'fallback';

export interface GeneratedWords {
  words: string[];
  source: WordSource;
}

export interface GuessResult {
  correct: boolean;
  letterStatuses: Record<string, LETTER_STATUS>;
}

export interface WordGenerator {
  generateWords(config: LexiGuessConfig): Promise<GeneratedWords>;
}

export interface WordCache {
  // Basic word storage
  getWord(config: LexiGuessConfig): string | null;
  setWord(config: LexiGuessConfig, word: string, source: WordSource): void;
  
  // Game mode specific retrieval
  getDailyWord(config: LexiGuessConfig): Promise<{ word: string; source: WordSource }>;
  getPracticeWord(config: LexiGuessConfig, cacheKey: string): Promise<{ word: string; source: WordSource }>;
  
  // Used words tracking
  getUsedWords(config: LexiGuessConfig): Set<string>;
  addUsedWord(config: LexiGuessConfig, word: string): void;
  clearUsedWords(config: LexiGuessConfig): void;
}

export interface WordValidator {
  validateGuess(guess: string, answer: string): Promise<GuessResult>;
}

export interface InitResult {
  gameId: string;
  source: WordSource;
}

export interface WordService {
  generateWords(config: LexiGuessConfig): Promise<string[]>;
  validateGuess(guess: string, answer: string): GuessResult;
  initializeGame(config: LexiGuessConfig): Promise<InitResult>;
}

export const LANGUAGE_PROMPTS: Record<Locale, string> = {
  'EN': 'English',
  'PL': 'Polish',
};

export const FALLBACK_WORDS: Record<Locale, string[]> = {
  'EN': ['HELLO', 'WORLD', 'LIGHT', 'SPACE', 'DREAM', 'HAPPY', 'SMILE', 'PEACE', 'LEARN', 'THINK'],
  'PL': ['KOTKI', 'LAMPA', 'KRATA', 'DROGA', 'PRACA', 'DOBRY', 'SLOWO', 'NIEBO', 'WIATR', 'KWIAT']
}; 