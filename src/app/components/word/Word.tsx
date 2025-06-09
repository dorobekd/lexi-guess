"use client";
import { map } from "lodash-es";
import { LETTER_STATUS } from "../types";
import { Box } from "@mui/material";
import Letter from "./Letter";
import { useGameStateContext } from "@/app/providers/GameStateProvider";

type WordProps = {
  guess: string;
  isSubmitted?: boolean;
  maxLength: number;
  isActive?: boolean;
  index?: number;
};

const Word = ({ guess, isSubmitted = false, maxLength, isActive = false, index = 0 }: WordProps) => {
  const { wordStatuses } = useGameStateContext();

  const getPosition = (letter: string, position: number): LETTER_STATUS => {
    if (!isSubmitted) {
      return isActive ? LETTER_STATUS.GUESSED : LETTER_STATUS.NOT_GUESSED;
    }
    
    return wordStatuses[index]?.[position] || LETTER_STATUS.NOT_IN_WORD;
  };

  const guessedLetters = map(guess.split(""), (letter, position) => ({
    letter,
    position: getPosition(letter, position),
  }));

  const placeholdersNeeded = maxLength - guessedLetters.length;
  const placeholders = Array(placeholdersNeeded).fill({
    letter: " ",
    position: isActive ? LETTER_STATUS.GUESSED : LETTER_STATUS.NOT_GUESSED
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
      {[...guessedLetters, ...placeholders].map(({ letter, position }, letterIndex) => (
        <Letter
          key={`${letter}-${position}-${letterIndex}`}
          letter={letter}
          position={position}
          index={letterIndex}
        />
      ))}
    </Box>
  );
};

export default Word;
