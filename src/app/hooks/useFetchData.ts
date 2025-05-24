import { useState, useCallback, useEffect } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown[];
  cache?: RequestCache;
}

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseFetchDataOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialFetchUrl?: string;
}

interface UseFetchDataReturn<T> extends FetchState<T> {
  fetchData: (url: string, options?: FetchOptions) => Promise<void>;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
};

export function useFetchData<T>(options: UseFetchDataOptions<T> = {}): UseFetchDataReturn<T> {
  const { initialData = null, onSuccess, onError, initialFetchUrl } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: initialData,
    error: null,
    isLoading: false,
  });

  const fetchData = useCallback(async (url: string, options: FetchOptions = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = 'no-store',
    } = options;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(url, {
        method,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache,
      });

      if (!response.ok) {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setState(prev => ({ ...prev, data, isLoading: false }));
      onSuccess?.(data);
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error('An unknown error occurred');
      setState(prev => ({
        ...prev,
        error: finalError,
        isLoading: false,
      }));
      onError?.(finalError);
    }
  }, [onSuccess, onError]);

  // Perform initial fetch if URL is provided
  useEffect(() => {
    if (initialFetchUrl) {
      fetchData(initialFetchUrl);
    }
  }, [initialFetchUrl, fetchData]);

  return {
    ...state,
    fetchData,
  };
}

// Example usage:
/*
interface WordResponse {
  words: string[];
  error?: string;
}

function MyComponent() {
  const { data, error, isLoading, fetchData } = useFetchData<WordResponse>({
    onSuccess: (data) => {
      console.log('Data fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to fetch data:', error);
    }
  });

  // GET request
  const handleFetch = () => {
    fetchData('/api/words?config=...');
  };

  // POST request
  const handleSubmit = () => {
    fetchData('/api/words', {
      method: 'POST',
      body: { data: 'example' },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      {data.words.map(word => <div key={word}>{word}</div>)}
    </div>
  );
}
*/ 