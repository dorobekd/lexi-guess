"use client";

import { useState } from "react";
import OnScreenKeyboard from "../keyboard/OnScreenKeyboard";
import Word from "../word/Word";
import { Box } from "@mui/material";
import { LexiGuessConfig } from "../config";
import SettingsDialog from "../SettingsDialog";
import GameOverModal from "../modals/GameOverModal";
import VictoryModal from "../modals/VictoryModal";
import { useConfigContext } from "../../providers/ConfigProvider";
import { GameStateProvider, useGameStateContext } from "../../providers/GameStateProvider";

function LexiGuessContent() {
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

  const handleSaveConfig = async (newConfig: LexiGuessConfig) => {
    await saveConfig(newConfig);
    await resetGame(); // Reset the game with new config
  };

  // Create array of all possible word slots
  const allWordSlots = Array.from({ length: config.maxGuesses });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', position: 'relative', width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

export default function LexiGuessContainer() {
  return (
    <GameStateProvider>
      <LexiGuessContent />
    </GameStateProvider>
  );
}
