"use client";

import { useEffect } from 'react';
import { Box } from "@mui/material";
import { LETTER_STATUS } from '../types';
import Letter from '../word/Letter';
import KeyboardControls from './KeyboardControls';

export type OnScreenKeyboardProps = {
  onChange: (value: string) => void;
  onSubmit: () => void;
  value: string;
  keyStatuses: Record<string, LETTER_STATUS>;
  maxLength: number;
  disabled?: boolean;
  rows: string[][];
};

export default function OnScreenKeyboard({ 
  onChange, 
  onSubmit, 
  value, 
  keyStatuses,
  maxLength,
  disabled = false,
  rows
}: OnScreenKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Enter') {
        if (value.length === maxLength) {
          onSubmit();
        }
      } else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
      } else {
        const key = e.key.toUpperCase();
        if (rows.flat().includes(key) && value.length < maxLength) {
          onChange(value + key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, maxLength, onChange, onSubmit, rows, value]);

  const handleKeyClick = (key: string) => {
    if (disabled || value.length >= maxLength) return;
    onChange(value + key);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '600px', 
      mx: 'auto',
      p: 2,
      borderRadius: 2,
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
      }}>
        {rows.map((row, i) => (
          <Box 
            key={i} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 0.5,
              mx: 'auto',
              width: '100%',
              '&:nth-of-type(2)': {
                pl: 4
              }
            }}
          >
            {row.map((key) => (
              <Box
                key={key}
                onClick={() => handleKeyClick(key)}
                sx={{ 
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    transform: disabled ? 'none' : 'scale(1.05)',
                  }
                }}
              >
                <Letter
                  letter={key}
                  position={keyStatuses[key] || LETTER_STATUS.NOT_GUESSED}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <KeyboardControls
          onBackspace={() => onChange(value.slice(0, -1))}
          onSubmit={onSubmit}
          isSubmitDisabled={value.length !== maxLength}
        />
      </Box>
    </Box>
  );
}
