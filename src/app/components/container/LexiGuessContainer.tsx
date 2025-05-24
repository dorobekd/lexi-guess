"use client";

import { useState } from "react";
import OnScreenKeyboard from "../keyboard/OnScreenKeyboard";
import Word from "../word/Word";
import { Box, Alert } from "@mui/material";
import { LexiGuessConfig } from "../config";
import SettingsDialog from "../SettingsDialog";
import GameOverModal from "../modals/GameOverModal";
import VictoryModal from "../modals/VictoryModal";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useConfigContext } from "../../providers/ConfigProvider";
import { GameStateProvider, useGameStateContext } from "../../providers/GameStateProvider";

function LexiGuessContent() {
  const { config, loading, error, saveConfig } = useConfigContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { 
    currentGuess,
    submittedGuesses,
    keyboardStatuses,
    answer,
    hasWon,
    isGameOver,
    setCurrentGuess,
    submitGuess,
    resetGame
  } = useGameStateContext();

  const handleSaveConfig = async (newConfig: LexiGuessConfig) => {
    try {
      await saveConfig(newConfig);
      resetGame(); // Reset the game with new config
    } catch {
      // Error is already handled by useConfig
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 4 }}>
        <LoadingPlaceholder 
          wordRows={config.maxGuesses} 
          keyboardRows={config.keyboardRows.length} 
        />
      </Box>
    );
  }

  // Create array of all possible word slots
  const allWordSlots = Array.from({ length: config.maxGuesses });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', position: 'relative', width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error.message}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {allWordSlots.map((_, index) => {
          const isCurrentRow = index === submittedGuesses.length;
          const isSubmittedRow = index < submittedGuesses.length;

          return (
            <Word 
              key={index}
              guess={isCurrentRow ? currentGuess : isSubmittedRow ? submittedGuesses[index] : ""}
              answer={answer}
              isSubmitted={isSubmittedRow}
              maxLength={config.maxWordLength}
              isActive={isCurrentRow}
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
      <GameOverModal 
        open={isGameOver && !hasWon} 
        onClose={resetGame}
      />
      <VictoryModal 
        open={hasWon}
        onClose={resetGame}
        guessCount={submittedGuesses.length}
      />
    </Box>
  );
}

export default function LexiGuessContainer() {
  const { config } = useConfigContext();
  
  return (
    <GameStateProvider maxGuesses={config.maxGuesses}>
      <LexiGuessContent />
    </GameStateProvider>
  );
}

export function useGameGuesses() {
  const { currentGuess, submittedGuesses, setCurrentGuess } = useGameStateContext();
  return { currentGuess, submittedGuesses, setCurrentGuess };
}

export function useKeyboard() {
  const { keyboardStatuses } = useGameStateContext();
  return { keyboardStatuses };
}
