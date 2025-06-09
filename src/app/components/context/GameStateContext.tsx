import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LETTER_STATUS } from '../types';
import { LexiGuessConfig } from '../config';
import { lexiGuessService } from '@/app/services/LexiGuessService';
import { withComponentContext } from '@/lib/logger';

interface GameState {
  guesses: string[];
  letterStatuses: Record<string, LETTER_STATUS>;
  gameOver: boolean;
  won: boolean;
  gameId: string | null;
  wordSource: string | null;
  isInitializing: boolean;
}

interface GameStateContextType {
  state: GameState;
  config: LexiGuessConfig;
  initializeGame: (config: LexiGuessConfig) => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
  updateConfig: (newConfig: LexiGuessConfig) => void;
}

const initialState: GameState = {
  guesses: [],
  letterStatuses: {},
  gameOver: false,
  won: false,
  gameId: null,
  wordSource: null,
  isInitializing: false,
};

const defaultConfig: LexiGuessConfig = {
  maxWordLength: 5,
  maxGuesses: 6,
  gameMode: 'practice',
  locale: 'EN',
  keyboardRows: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ],
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

const logger = withComponentContext('GameStateContext');

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [config, setConfig] = useState<LexiGuessConfig>(defaultConfig);

  const initializeGame = useCallback(async (newConfig: LexiGuessConfig) => {
    // Prevent multiple simultaneous initialization calls
    if (state.isInitializing) {
      logger.warn('Game initialization already in progress');
      return;
    }

    try {
      setState(prev => ({ ...prev, isInitializing: true }));
      const result = await lexiGuessService.initializeGame(newConfig);
      setState({
        ...initialState,
        gameId: result.gameId,
        wordSource: result.source,
        isInitializing: false,
      });
      setConfig(newConfig);
    } catch (error) {
      setState(prev => ({ ...prev, isInitializing: false }));
      logger.error('Failed to initialize game', { 
        error: error instanceof Error ? { message: error.message } : error 
      });
      throw error;
    }
  }, [state.isInitializing]);

  const submitGuess = useCallback(async (guess: string) => {
    if (!state.gameId) {
      throw new Error('Game not initialized');
    }

    try {
      const result = await lexiGuessService.submitGuess(config, guess, state.gameId);
      
      setState(prevState => {
        const newGuesses = [...prevState.guesses, guess];
        const gameOver = result.correct || newGuesses.length >= config.maxGuesses;
        
        return {
          ...prevState,
          guesses: newGuesses,
          letterStatuses: { ...prevState.letterStatuses, ...result.letterStatuses },
          gameOver,
          won: result.correct,
        };
      });
    } catch (error) {
      logger.error('Failed to submit guess', { 
        error: error instanceof Error ? { message: error.message } : error 
      });
      throw error;
    }
  }, [config, state.gameId]);

  const updateConfig = useCallback((newConfig: LexiGuessConfig) => {
    setConfig(newConfig);
  }, []);

  // Initialize game on first render
  useEffect(() => {
    if (!state.gameId && !state.isInitializing) {
      initializeGame(config).catch(error => logger.error('Failed to initialize game', { error }));
    }
  }, [config, initializeGame, state.gameId, state.isInitializing]);

  return (
    <GameStateContext.Provider value={{ state, config, initializeGame, submitGuess, updateConfig }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
} 