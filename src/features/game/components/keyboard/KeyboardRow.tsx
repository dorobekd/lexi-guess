import { Box } from "@mui/material";
import { LETTER_STATUS } from "../types";
import Letter from "../word/Letter";

type KeyboardRowProps = {
  row: { value: string }[];
  rowIndex: number;
  totalRows: number;
  keyStatuses: Record<string, LETTER_STATUS>;
  currentGuess: string;
  onKeyClick: (key: string) => void;
  maxLength: number;
};

export default function KeyboardRow({ 
  row, 
  rowIndex, 
  totalRows, 
  keyStatuses, 
  currentGuess,
  onKeyClick,
  maxLength
}: KeyboardRowProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 0.5,
        mb: rowIndex < totalRows - 1 ? 0.5 : 0
      }}
    >
      {row.map(({ value }) => {
        const keyStatus = keyStatuses[value] || LETTER_STATUS.NOT_GUESSED;
        const isDisabled = keyStatus === LETTER_STATUS.NOT_IN_WORD || currentGuess.length >= maxLength;
        const isInCurrentGuess = currentGuess.includes(value);
        
        // Keep the actual status for correct/wrong position/not in word,
        // otherwise show as guessed/not guessed
        const displayStatus = [
          LETTER_STATUS.IN_POSITION,
          LETTER_STATUS.OUT_OF_POSITION,
          LETTER_STATUS.NOT_IN_WORD
        ].includes(keyStatus)
          ? keyStatus
          : isInCurrentGuess ? LETTER_STATUS.GUESSED : LETTER_STATUS.NOT_GUESSED;

        return (
          <Box
            key={value}
            onClick={() => onKeyClick(value)}
            sx={{ 
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.8 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <Letter
              letter={value}
              position={displayStatus}
            />
          </Box>
        );
      })}
    </Box>
  );
} 