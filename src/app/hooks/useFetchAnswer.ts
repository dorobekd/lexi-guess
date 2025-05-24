import { useFetchData } from './useFetchData';
import { useCallback, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash-es';
import { useConfigContext } from '../providers/ConfigProvider';

interface AnswerResponse {
  word: string;
}

interface UseFetchAnswerReturn {
  answer: string | null;
  loading: boolean;
  error: Error | null;
  refreshAnswer: () => Promise<void>;
}

export function useFetchAnswer(): UseFetchAnswerReturn {
  const { config, loading: isConfigLoading } = useConfigContext();
  const isInitialized = useRef(false);
  
  const { 
    data, 
    error, 
    isLoading, 
    fetchData 
  } = useFetchData<AnswerResponse>();

  const refreshAnswer = useCallback(async () => {
    if (isEmpty(config)) return;
    await fetchData(`/api/words?config=${encodeURIComponent(JSON.stringify(config))}`);
  }, [fetchData, config]);

  useEffect(() => {
    if (!isInitialized.current && !isConfigLoading && !isEmpty(config)) {
      isInitialized.current = true;
      refreshAnswer();
    }
  }, [config, isConfigLoading, refreshAnswer]);

  return {
    answer: data?.word ?? null,
    loading: isLoading,
    error,
    refreshAnswer
  };
} 