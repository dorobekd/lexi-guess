"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { LETTER_STATUS } from '../components/types';
import { useFetchAnswer } from '../hooks/useFetchAnswer';
import { useConfigContext } from './ConfigProvider';
import { logger } from '@/lib/clientLogger';

type GameState = {
  guessState: {
    submitted: string[];
    current: string;
  };
  keyboardState: Record<string, LETTER_STATUS>;
  wordStates: Record<number, Record<number, LETTER_STATUS>>; // Index -> Position -> Status
  isGameOver: boolean;
  hasWon: boolean;
};

type GameStateContextType = {
  // Selectors
  currentGuess: string;
  submittedGuesses: string[];
  keyboardStatuses: Record<string, LETTER_STATUS>;
  wordStatuses: Record<number, Record<number, LETTER_STATUS>>;
  hasWon: boolean;
  isGameOver: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setCurrentGuess: (guess: string) => void;
  submitGuess: () => void;
  resetGame: () => void;
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

type GameStateProviderProps = {
  children: ReactNode;
};

export function GameStateProvider({ children }: GameStateProviderProps) {
  const { config, loading: isConfigLoading } = useConfigContext();
  const { 
    loading: isAnswerLoading,
    error,
    initializeGame,
    submitGuess: validateGuess
  } = useFetchAnswer();

  const initializationAttempted = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    guessState: {
      submitted: [],
      current: "",
    },
    keyboardState: {},
    wordStates: {},
    isGameOver: false,
    hasWon: false
  });

  const setCurrentGuess = useCallback((guess: string) => {
    if (gameState.isGameOver) return;
    
    setGameState(prev => ({
      ...prev,
      guessState: {
        ...prev.guessState,
        current: guess
      }
    }));
  }, [gameState.isGameOver]);

  const submitGuess = useCallback(async () => {
    if (gameState.isGameOver || !gameState.guessState.current) return;

    const guess = gameState.guessState.current;
    const result = await validateGuess(guess);
    
    // Update keyboard state with the received letter statuses
    const newKeyboardState = { ...gameState.keyboardState };
    const guessIndex = gameState.guessState.submitted.length;

    // Store the position-based statuses for this guess
    const newWordStates = { ...gameState.wordStates };
    newWordStates[guessIndex] = result.letterStatuses;

    // Update keyboard state based on the best status for each letter
    Object.entries(result.letterStatuses).forEach(([position, status]) => {
      const letter = guess[parseInt(position)];
      // Only update if the new status is more favorable than the existing one
      if (!newKeyboardState[letter] || 
          (status === LETTER_STATUS.IN_POSITION) || 
          (status === LETTER_STATUS.OUT_OF_POSITION && newKeyboardState[letter] === LETTER_STATUS.NOT_IN_WORD)) {
        newKeyboardState[letter] = status;
      }
    });

    setGameState(prev => ({
      ...prev,
      guessState: {
        submitted: [...prev.guessState.submitted, guess],
        current: "",
      },
      keyboardState: newKeyboardState,
      wordStates: newWordStates,
      hasWon: result.correct,
      isGameOver: result.correct || prev.guessState.submitted.length + 1 >= config.maxGuesses
    }));
  }, [gameState.isGameOver, gameState.guessState, gameState.keyboardState, gameState.wordStates, validateGuess, config.maxGuesses]);

  const resetGame = useCallback(async () => {
    try {
      await initializeGame();
      setGameState({
        guessState: {
          submitted: [],
          current: "",
        },
        keyboardState: {},
        wordStates: {},
        isGameOver: false,
        hasWon: false
      });
    } catch (error) {
      logger.error('Failed to reset game', { 
        error: error instanceof Error ? { message: error.message } : error 
      });
    }
  }, [initializeGame]);

  // Initialize game when config is ready
  useEffect(() => {
    if (isConfigLoading || !config || initializationAttempted.current) {
      return;
    }

    initializationAttempted.current = true;
    resetGame().catch((error) => {
      logger.error('Failed to initialize game', { 
        error: error instanceof Error ? { message: error.message } : error 
      });
    });
  }, [isConfigLoading, config, resetGame]);

  const value = {
    // Selectors
    currentGuess: gameState.guessState.current,
    submittedGuesses: gameState.guessState.submitted,
    keyboardStatuses: gameState.keyboardState,
    wordStatuses: gameState.wordStates,
    hasWon: gameState.hasWon,
    isGameOver: gameState.isGameOver,
    isLoading: isConfigLoading || isAnswerLoading,
    error,
    
    // Actions
    setCurrentGuess,
    submitGuess,
    resetGame,
  };

  if (isConfigLoading || isAnswerLoading) {
    return null; // or a loading spinner
  }

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameStateContext() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameStateContext must be used within a GameStateProvider');
  }
  return context;
} 