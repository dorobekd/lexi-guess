"use client";
import { useState } from "react";
import OnScreenKeyboard from "../keyboard/OnScreenKeyboard";
import Word from "../word/Word";
import { Box, IconButton, Alert } from "@mui/material";
import { LETTER_STATUS } from "../types";
import { WordliConfig } from "../config";
import SettingsDialog from "../SettingsDialog";
import SettingsIcon from '@mui/icons-material/Settings';
import GameOverModal from "../modals/GameOverModal";
import VictoryModal from "../modals/VictoryModal";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useConfigContext } from "../../providers/ConfigProvider";

export default function WordliContainer() {
  const { config, loading, error, saveConfig } = useConfigContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [answer] = useState("FARTS");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardStatuses, setKeyboardStatuses] = useState<Record<string, LETTER_STATUS>>({});

  const getLetterStatus = (letter: string, index: number): LETTER_STATUS => {
    if (answer.includes(letter)) {
      if (answer[index] === letter) return LETTER_STATUS.IN_POSITION;
      return LETTER_STATUS.OUT_OF_POSITION;
    }
    return LETTER_STATUS.NOT_IN_WORD;
  };

  const handleSubmitGuess = () => {
    const newKeyboardStatuses = { ...keyboardStatuses };
    currentGuess.split('').forEach((letter, index) => {
      const status = getLetterStatus(letter, index);
      if (!newKeyboardStatuses[letter] || 
          (status === LETTER_STATUS.IN_POSITION) || 
          (status === LETTER_STATUS.OUT_OF_POSITION && newKeyboardStatuses[letter] === LETTER_STATUS.NOT_IN_WORD)) {
        newKeyboardStatuses[letter] = status;
      }
    });
    setKeyboardStatuses(newKeyboardStatuses);

    setGuesses(prev => [...prev, currentGuess]);
    setCurrentGuess("");
  };

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess("");
    setKeyboardStatuses({});
  };

  const handleSaveConfig = async (newConfig: WordliConfig) => {
    try {
      await saveConfig(newConfig);
      resetGame(); // Reset the game with new config
    } catch {
      // Error is already handled by useConfig
    }
  };

  const hasWon = guesses.length > 0 && guesses[guesses.length - 1] === answer;
  const isGameOver = guesses.length >= config.maxGuesses || hasWon;

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
      <IconButton 
        onClick={() => setSettingsOpen(true)}
        sx={{ position: 'absolute', top: 0, right: 0 }}
      >
        <SettingsIcon />
      </IconButton>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {allWordSlots.map((_, index) => {
          const isCurrentRow = index === guesses.length;
          const isSubmittedRow = index < guesses.length;

          return (
            <Word 
              key={index}
              guess={isCurrentRow ? currentGuess : isSubmittedRow ? guesses[index] : ""}
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
        onSubmit={handleSubmitGuess}
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
        guessCount={guesses.length}
      />
    </Box>
  );
}
