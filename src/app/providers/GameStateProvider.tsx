"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { LETTER_STATUS } from '../components/types';
import { useFetchAnswer } from '../hooks/useFetchAnswer';
import { useConfigContext } from './ConfigProvider';

type GameState = {
  answer: string;
  guessState: {
    submitted: string[];
    current: string;
  };
  keyboardState: Record<string, LETTER_STATUS>;
};

type GameStateContextType = {
  // Selectors
  currentGuess: string;
  submittedGuesses: string[];
  keyboardStatuses: Record<string, LETTER_STATUS>;
  answer: string;
  hasWon: boolean;
  isGameOver: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setCurrentGuess: (guess: string) => void;
  submitGuess: () => void;
  resetGame: () => void;
};

const GameStateContext = createContext<GameStateContextType | null>(null);

export function useGameStateContext() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameStateContext must be used within a GameStateProvider');
  }
  return context;
}

type GameStateProviderProps = {
  children: ReactNode;
  maxGuesses: number;
};

export function GameStateProvider({ children, maxGuesses }: GameStateProviderProps) {
  const { loading: isConfigLoading } = useConfigContext();
  const { 
    answer: fetchedAnswer, 
    loading, 
    error,
    refreshAnswer 
  } = useFetchAnswer();

  const [gameState, setGameState] = useState<GameState>({
    answer: fetchedAnswer || "     ", // Placeholder until answer is fetched
    guessState: {
      submitted: [],
      current: "",
    },
    keyboardState: {},
  });

  // Update game state when answer is fetched
  useEffect(() => {
    if (fetchedAnswer) {
      setGameState(prev => ({
        ...prev,
        answer: fetchedAnswer
      }));
    }
  }, [fetchedAnswer]);

  const getLetterStatus = useCallback((letter: string, index: number): LETTER_STATUS => {
    if (gameState.answer.includes(letter)) {
      if (gameState.answer[index] === letter) return LETTER_STATUS.IN_POSITION;
      return LETTER_STATUS.OUT_OF_POSITION;
    }
    return LETTER_STATUS.NOT_IN_WORD;
  }, [gameState.answer]);

  const setCurrentGuess = useCallback((guess: string) => {
    setGameState(prev => ({
      ...prev,
      guessState: {
        ...prev.guessState,
        current: guess
      }
    }));
  }, []);

  const submitGuess = useCallback(() => {
    setGameState(prev => {
      const newKeyboardState = { ...prev.keyboardState };
      prev.guessState.current.split('').forEach((letter, index) => {
        const status = getLetterStatus(letter, index);
        if (!newKeyboardState[letter] || 
            (status === LETTER_STATUS.IN_POSITION) || 
            (status === LETTER_STATUS.OUT_OF_POSITION && newKeyboardState[letter] === LETTER_STATUS.NOT_IN_WORD)) {
          newKeyboardState[letter] = status;
        }
      });

      return {
        ...prev,
        guessState: {
          submitted: [...prev.guessState.submitted, prev.guessState.current],
          current: "",
        },
        keyboardState: newKeyboardState
      };
    });
  }, [getLetterStatus]);

  const resetGame = useCallback(async () => {
    await refreshAnswer();
    setGameState(prev => ({
      ...prev,
      guessState: {
        submitted: [],
        current: "",
      },
      keyboardState: {},
    }));
  }, [refreshAnswer]);

  const hasWon = gameState.guessState.submitted.length > 0 && 
    gameState.guessState.submitted[gameState.guessState.submitted.length - 1] === gameState.answer;
  const isGameOver = gameState.guessState.submitted.length >= maxGuesses || hasWon;

  const value = {
    // Selectors
    currentGuess: gameState.guessState.current,
    submittedGuesses: gameState.guessState.submitted,
    keyboardStatuses: gameState.keyboardState,
    answer: gameState.answer,
    hasWon,
    isGameOver,
    isLoading: isConfigLoading || loading,
    error,
    
    // Actions
    setCurrentGuess,
    submitGuess,
    resetGame,
  };

  if ((isConfigLoading || loading) && !gameState.answer) {
    return null; // or a loading spinner
  }

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
} 