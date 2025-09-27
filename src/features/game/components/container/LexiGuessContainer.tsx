"use client";

import { useState } from "react";
import OnScreenKeyboard from '@/features/game/components/keyboard/OnScreenKeyboard';
import Word from '@/features/game/components/word/Word';
import { Box } from "@mui/material";
import { LexiGuessConfig } from '@/features/game/config';
import SettingsDialog from "../SettingsDialog";
import GameOverModal from '@/features/game/components/modals/GameOverModal';
import VictoryModal from '@/features/game/components/modals/VictoryModal';
import { useConfigContext } from '@/shared/providers/ConfigProvider';
import { useGameStateContext } from '@/shared/providers/GameStateProvider';
import { useKeyboardInput } from '@/features/game/components/keyboard/useKeyboardInput';

export default function LexiGuessContainer() {
  const { config, saveConfig } = useConfigContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { 
    currentGuess,
    submittedGuesses,
    keyboardStatuses,
    hasWon,
    isGameOver,
    setCurrentGuess,
    submitGuess,
    resetGame
  } = useGameStateContext();
  

  // Set up keyboard input
  useKeyboardInput({
    currentGuess,
    isGameOver,
    setCurrentGuess,
    submitGuess
  });

  const handleSaveConfig = async (newConfig: LexiGuessConfig) => {
    await saveConfig(newConfig);
    await resetGame(); // Reset the game with new config
  };

  // Create array of all possible word slots
  const allWordSlots = Array.from({ length: config.maxGuesses });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: { xs: 1.5, sm: 2 }, 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative', 
      width: '100%',
      maxWidth: { xs: '100%', sm: '500px' },
      mx: 'auto',
      px: { xs: 1, sm: 2 },
      minHeight: 'fit-content'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: { xs: 0.5, sm: 1 },
        width: '100%',
        alignItems: 'center'
      }}>
        {allWordSlots.map((_, index) => {
          const isSubmitted = index < submittedGuesses.length;
          const isActive = index === submittedGuesses.length;
          const guess = isSubmitted ? submittedGuesses[index] : 
                       isActive ? currentGuess : '';

          return (
            <Word
              key={index}
              index={index}
              guess={guess}
              isSubmitted={isSubmitted}
              maxLength={config.maxWordLength}
              isActive={isActive}
            />
          );
        })}
      </Box>

      <OnScreenKeyboard
        onChange={setCurrentGuess}
        onSubmit={submitGuess}
        value={currentGuess}
        keyStatuses={keyboardStatuses}
        maxLength={config.maxWordLength}
        disabled={isGameOver}
        rows={config.keyboardRows}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentConfig={config}
        onSave={handleSaveConfig}
      />

      {isGameOver && !hasWon && (
        <GameOverModal
          open={true}
          onClose={resetGame}
        />
      )}

      {hasWon && (
        <VictoryModal
          open={true}
          onClose={resetGame}
          guessCount={submittedGuesses.length}
        />
      )}
    </Box>
  );
}
