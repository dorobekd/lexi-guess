import { useState } from 'react';
import { LETTER_STATUS } from '../components/types';

type UseGameStateReturn = {
  answer: string;
  guesses: string[];
  currentGuess: string;
  keyboardStatuses: Record<string, LETTER_STATUS>;
  hasWon: boolean;
  isGameOver: boolean;
  setCurrentGuess: (guess: string) => void;
  submitGuess: () => void;
  resetGame: () => void;
};

export function useGameState(maxGuesses: number): UseGameStateReturn {
  const [answer] = useState("FARTS"); // TODO: Make this dynamic/configurable
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardStatuses, setKeyboardStatuses] = useState<Record<string, LETTER_STATUS>>({});

  const getLetterStatus = (letter: string, index: number): LETTER_STATUS => {
    if (answer.includes(letter)) {
      if (answer[index] === letter) return LETTER_STATUS.IN_POSITION;
      return LETTER_STATUS.OUT_OF_POSITION;
    }
    return LETTER_STATUS.NOT_IN_WORD;
  };

  const submitGuess = () => {
    const newKeyboardStatuses = { ...keyboardStatuses };
    currentGuess.split('').forEach((letter, index) => {
      const status = getLetterStatus(letter, index);
      if (!newKeyboardStatuses[letter] || 
          (status === LETTER_STATUS.IN_POSITION) || 
          (status === LETTER_STATUS.OUT_OF_POSITION && newKeyboardStatuses[letter] === LETTER_STATUS.NOT_IN_WORD)) {
        newKeyboardStatuses[letter] = status;
      }
    });
    setKeyboardStatuses(newKeyboardStatuses);

    setGuesses(prev => [...prev, currentGuess]);
    setCurrentGuess("");
  };

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess("");
    setKeyboardStatuses({});
  };

  const hasWon = guesses.length > 0 && guesses[guesses.length - 1] === answer;
  const isGameOver = guesses.length >= maxGuesses || hasWon;

  return {
    answer,
    guesses,
    currentGuess,
    keyboardStatuses,
    hasWon,
    isGameOver,
    setCurrentGuess,
    submitGuess,
    resetGame
  };
} 