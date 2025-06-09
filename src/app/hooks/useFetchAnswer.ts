import { useCallback, useRef, useState } from 'react';
import { isEmpty } from 'lodash-es';
import { useConfigContext } from '../providers/ConfigProvider';
import { LETTER_STATUS } from '../components/types';
import { lexiGuessService } from '../services/LexiGuessService';
import { logger } from '@/lib/clientLogger';

interface UseFetchAnswerReturn {
  isCorrect: boolean | null;
  loading: boolean;
  error: Error | null;
  initializeGame: () => Promise<void>;
  submitGuess: (guess: string) => Promise<{ correct: boolean; letterStatuses: Record<string, LETTER_STATUS> }>;
}

export function useFetchAnswer(): UseFetchAnswerReturn {
  const { config } = useConfigContext();
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const gameId = useRef<string | null>(null);

  const initializeGame = useCallback(async () => {
    if (isEmpty(config)) {
      logger.warn('Cannot initialize game: config is empty');
      return;
    }

    if (loading) {
      logger.warn('Game initialization already in progress');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await lexiGuessService.initializeGame(config);
      gameId.current = result.gameId;
      setIsCorrect(null);
    } catch (err) {
      logger.error('Failed to initialize game', { 
        error: err instanceof Error ? { message: err.message } : err 
      });
      setError(err instanceof Error ? err : new Error('Failed to initialize game'));
      gameId.current = null;
    } finally {
      setLoading(false);
    }
  }, [config, loading]);

  const submitGuess = useCallback(async (guess: string) => {
    if (isEmpty(config)) {
      logger.warn('Cannot submit guess: config is empty');
      return { correct: false, letterStatuses: {} };
    }

    if (!gameId.current) {
      logger.warn('Cannot submit guess: game not initialized');
      return { correct: false, letterStatuses: {} };
    }

    if (loading) {
      logger.warn('Guess submission already in progress');
      return { correct: false, letterStatuses: {} };
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await lexiGuessService.submitGuess(config, guess, gameId.current);
      setIsCorrect(result.correct);
      return result;
    } catch (err) {
      logger.error('Failed to submit guess', { 
        error: err instanceof Error ? { message: err.message } : err 
      });
      setError(err instanceof Error ? err : new Error('Failed to submit guess'));
      return { correct: false, letterStatuses: {} };
    } finally {
      setLoading(false);
    }
  }, [config, loading]);

  return {
    isCorrect,
    loading,
    error,
    initializeGame,
    submitGuess
  };
} 