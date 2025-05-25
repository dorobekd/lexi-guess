"use client";

import { Box } from "@mui/material";
import { LETTER_STATUS } from '../types';
import Letter from '../word/Letter';
import KeyboardControls from './KeyboardControls';
import { useKeyboardInput } from './useKeyboardInput';

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

  useKeyboardInput();
  

  const handleKeyClick = (key: string) => {
    if (disabled || value.length >= maxLength) return;
    onChange(value + key);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: { xs: '100vw', sm: '600px' }, 
      mx: 'auto',
      p: { xs: 1, sm: 2 },
      borderRadius: 2,
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: { xs: 0.5, sm: 1 },
      }}>
        {rows.map((row, index) => (
          <Box 
            key={index} 
            sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 0.25, sm: 0.5 },
            mx: 'auto',
            width: '100%',
          }}
          >
            {row.map((key) => (
              <Box
                key={key}
                onClick={() => handleKeyClick(key)}
                sx={{ 
                  maxWidth: { xs: 32, sm: 40 }, // Prevent keys from getting too wide
                  minHeight: { xs: 36 },
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
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
          isBackspaceDisabled={value === ''}
        />
      </Box>
    </Box>
  );
}
