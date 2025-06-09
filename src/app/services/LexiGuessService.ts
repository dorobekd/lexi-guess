import { LexiGuessConfig } from '../components/config';
import { LETTER_STATUS } from '../components/types';

export interface GuessResult {
  correct: boolean;
  letterStatuses: Record<string, LETTER_STATUS>;
}

export interface InitResult {
  gameId: string;
  source: string;
}

class LexiGuessService {
  private async fetchWithConfig<T>(
    url: string, 
    config: LexiGuessConfig,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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

    return response.json();
  }

  async initializeGame(config: LexiGuessConfig): Promise<InitResult> {
    return this.fetchWithConfig<InitResult>(
      '/api/lexi-guess',
      config,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  async submitGuess(config: LexiGuessConfig, guess: string, gameId: string): Promise<GuessResult> {
    return this.fetchWithConfig<GuessResult>(
      '/api/lexi-guess',
      config,
      {
        method: 'PUT',
        body: JSON.stringify({ guess, gameId }),
      }
    );
  }
}

// Export a singleton instance
export const lexiGuessService = new LexiGuessService(); 