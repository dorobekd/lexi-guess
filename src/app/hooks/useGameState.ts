import { useState } from 'react';
import { LETTER_STATUS } from '../components/types';

type GameState = {
  answer: string;
  guessState: {
    submitted: string[];
    current: string;
  };
  keyboardState: Record<string, LETTER_STATUS>;
};

type UseGameStateReturn = {
  gameState: GameState;
  hasWon: boolean;
  isGameOver: boolean;
  setCurrentGuess: (guess: string) => void;
  submitGuess: () => void;
  resetGame: () => void;
};

export function useGameState(maxGuesses: number): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>({
    answer: "FARTS", // TODO: Make this dynamic/configurable
    guessState: {
      submitted: [],
      current: "",
    },
    keyboardState: {},
  });

  const getLetterStatus = (letter: string, index: number): LETTER_STATUS => {
    if (gameState.answer.includes(letter)) {
      if (gameState.answer[index] === letter) return LETTER_STATUS.IN_POSITION;
      return LETTER_STATUS.OUT_OF_POSITION;
    }
    return LETTER_STATUS.NOT_IN_WORD;
  };

  const setCurrentGuess = (guess: string) => {
    setGameState(prev => ({
      ...prev,
      guessState: {
        ...prev.guessState,
        current: guess
      }
    }));
  };

  const submitGuess = () => {
    const newKeyboardState = { ...gameState.keyboardState };
    gameState.guessState.current.split('').forEach((letter, index) => {
      const status = getLetterStatus(letter, index);
      if (!newKeyboardState[letter] || 
          (status === LETTER_STATUS.IN_POSITION) || 
          (status === LETTER_STATUS.OUT_OF_POSITION && newKeyboardState[letter] === LETTER_STATUS.NOT_IN_WORD)) {
        newKeyboardState[letter] = status;
      }
    });

    setGameState(prev => ({
      ...prev,
      guessState: {
        submitted: [...prev.guessState.submitted, prev.guessState.current],
        current: "",
      },
      keyboardState: newKeyboardState
    }));
  };

  const resetGame = () => {
    setGameState({
      answer: "FARTS", // TODO: Make this dynamic/configurable
      guessState: {
        submitted: [],
        current: "",
      },
      keyboardState: {},
    });
  };

  const hasWon = gameState.guessState.submitted.length > 0 && 
    gameState.guessState.submitted[gameState.guessState.submitted.length - 1] === gameState.answer;
  const isGameOver = gameState.guessState.submitted.length >= maxGuesses || hasWon;

  return {
    gameState,
    hasWon,
    isGameOver,
    setCurrentGuess,
    submitGuess,
    resetGame
  };
} 