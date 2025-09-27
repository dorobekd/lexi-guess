export type Locale = 'EN' | 'PL';
export type GameMode = 'daily' | 'practice';

export interface LexiGuessConfig {
  maxWordLength: number;
  maxGuesses: number;
  gameMode: GameMode;
  locale: Locale;
  keyboardRows: string[][];
}

export const DEFAULT_CONFIG: LexiGuessConfig = {
  maxWordLength: 5,
  maxGuesses: 6,
  gameMode: 'practice',
  locale: 'EN',
  keyboardRows: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ]
}; 