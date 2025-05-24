"use client";
import { map } from "lodash-es";
import { LETTER_STATUS } from "../types";
import { Box } from "@mui/material";
import Letter from "./Letter";

type WordProps = {
  guess: string;
  answer: string;
  isSubmitted?: boolean;
  maxLength: number;
  isActive?: boolean;
};

const Word = ({ guess, answer, isSubmitted = false, maxLength, isActive = false }: WordProps) => {
  const getPosition = (letter: string, index: number) => {
    if (!isSubmitted) {
      return isActive ? LETTER_STATUS.GUESSED : LETTER_STATUS.NOT_GUESSED;
    }
    
    if (answer.includes(letter)) {
      if (answer[index] === guess[index]) return LETTER_STATUS.IN_POSITION;
      return LETTER_STATUS.OUT_OF_POSITION;
    }
    return LETTER_STATUS.NOT_IN_WORD;
  };

  const guessedLetters = map(guess.split(""), (letter, index) => ({
    letter,
    position: getPosition(letter, index),
  }));

  const placeholdersNeeded = maxLength - guessedLetters.length;
  const placeholders = Array(placeholdersNeeded).fill({
    letter: " ",
    position: isActive ? LETTER_STATUS.GUESSED : LETTER_STATUS.NOT_GUESSED
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
      {[...guessedLetters, ...placeholders].map(({ letter, position }, index) => (
        <Letter
          key={`${letter}-${position}-${index}`}
          letter={letter}
          position={position}
          index={index}
        />
      ))}
    </Box>
  );
};

export default Word;
