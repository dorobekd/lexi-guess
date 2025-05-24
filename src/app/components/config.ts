export type GameMode = 'daily' | 'practice' | 'custom';

export type WordliConfig = {
  maxWordLength: number;
  maxGuesses: number;
  gameMode: GameMode;
  keyboardRows: string[][];
};

export const DEFAULT_CONFIG: WordliConfig = {
  maxWordLength: 5,
  maxGuesses: 6,
  gameMode: 'practice',
  keyboardRows: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
  ]
}; 