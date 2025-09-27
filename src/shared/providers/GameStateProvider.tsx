"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef, useMemo } from 'react';
import { LETTER_STATUS } from '@/features/game/types';
import { useFetchAnswer } from '@/features/game/hooks/useFetchAnswer';
import { useConfigContext } from './ConfigProvider';
import { logger } from '@/shared/lib/clientLogger';

type GameState = {
  guessState: {
    submitted: string[];
    current: string;
  };
  keyboardState: Record<string, LETTER_STATUS>;
  wordStates: Record<number, Record<string, LETTER_STATUS>>; // Index -> Position -> Status
  isGameOver: boolean;
  hasWon: boolean;
};

type GameStateContextType = {
  // Selectors
  currentGuess: string;
  submittedGuesses: string[];
  keyboardStatuses: Record<string, LETTER_STATUS>;
  wordStatuses: Record<number, Record<string, LETTER_STATUS>>;
  hasWon: boolean;
  isGameOver: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setCurrentGuess: (guess: string) => void;
  submitGuess: () => Promise<void>;
  resetGame: () => Promise<void>;
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

type GameStateProviderProps = {
  children: ReactNode;
};

// Error boundary component for game state errors
function GameErrorBoundary({ children, error }: { children: ReactNode; error: Error | null }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Game Error</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reload Game
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

// Loading component optimized for SEO
function GameLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Game</h2>
      <p className="text-gray-500 text-center max-w-md">
        Preparing your word-guessing challenge...
      </p>
    </div>
  );
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  const { config, isLoading: isConfigLoading } = useConfigContext();
  const { 
    loading: isAnswerLoading,
    error: fetchError,
    initializeGame,
    submitGuess: validateGuess
  } = useFetchAnswer();

  const initializationAttempted = useRef(false);
  const [gameError, setGameError] = useState<Error | null>(null);

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

    try {
      setGameError(null);
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
    } catch (error) {
      const gameError = error instanceof Error ? error : new Error('Failed to submit guess');
      setGameError(gameError);
      logger.error('Failed to submit guess', { 
        error: { message: gameError.message } 
      });
    }
  }, [gameState.isGameOver, gameState.guessState, gameState.keyboardState, gameState.wordStates, validateGuess, config.maxGuesses]);

  const resetGame = useCallback(async () => {
    try {
      setGameError(null);
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
      const gameError = error instanceof Error ? error : new Error('Failed to reset game');
      setGameError(gameError);
      logger.error('Failed to reset game', { 
        error: { message: gameError.message } 
      });
    }
  }, [initializeGame]);

  // Initialize game when config is ready
  useEffect(() => {
    if (!config || isConfigLoading || initializationAttempted.current) {
      return;
    }

    initializationAttempted.current = true;
    resetGame().catch((error) => {
      const gameError = error instanceof Error ? error : new Error('Failed to initialize game');
      setGameError(gameError);
      logger.error('Failed to initialize game', { 
        error: { message: gameError.message } 
      });
    });
  }, [config, isConfigLoading, resetGame]);

  const isLoading = isConfigLoading || isAnswerLoading;
  const error = gameError || fetchError;

  const value = useMemo(() => ({
    // Selectors
    currentGuess: gameState.guessState.current,
    submittedGuesses: gameState.guessState.submitted,
    keyboardStatuses: gameState.keyboardState,
    wordStatuses: gameState.wordStates,
    hasWon: gameState.hasWon,
    isGameOver: gameState.isGameOver,
    isLoading,
    error,
    
    // Actions
    setCurrentGuess,
    submitGuess,
    resetGame,
  }), [
    gameState.guessState,
    gameState.keyboardState,
    gameState.wordStates,
    gameState.hasWon,
    gameState.isGameOver,
    isLoading,
    error,
    setCurrentGuess,
    submitGuess,
    resetGame,
  ]);

  return (
    <GameStateContext.Provider value={value}>
      <GameErrorBoundary error={error}>
        {isLoading ? (
          <GameLoadingState />
        ) : (
          children
        )}
      </GameErrorBoundary>
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