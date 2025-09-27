"use client";

import { useConfigContext } from '@/shared/providers/ConfigProvider';
import { useEffect } from "react";

type UseKeyboardInputProps = {
  currentGuess: string;
  isGameOver: boolean;
  setCurrentGuess: (guess: string) => void;
  submitGuess: () => void;
};

export function useKeyboardInput({ 
  currentGuess, 
  isGameOver, 
  setCurrentGuess, 
  submitGuess 
}: UseKeyboardInputProps) {
    const { config } = useConfigContext();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (isGameOver) return window.removeEventListener('keydown', handleKeyDown);
    
          if (e.key === 'Enter') {
            if (currentGuess.length === config?.maxWordLength) {
              submitGuess();
            }
          } else if (e.key === 'Backspace') {
            setCurrentGuess(currentGuess.slice(0, -1));
          } else {
            const key = e.key.toUpperCase();
            if (config?.keyboardRows.flat().includes(key) && currentGuess.length < config?.maxWordLength) {
              setCurrentGuess(currentGuess + key);
            }
          }
        };
    
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [isGameOver, currentGuess, config?.maxWordLength, config?.keyboardRows, setCurrentGuess, submitGuess]);
}
