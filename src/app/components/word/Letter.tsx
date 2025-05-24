import { Typography } from "@mui/material";
import { LETTER_STATUS } from "../types";
import { toUpper } from "lodash-es";
import { motion } from "framer-motion";

export const STATUS_COLORS = {
  success: "success.main",
  warning: "warning.main",
  error: "error.main",
  primary: "text.primary",
  secondary: "text.secondary",
} as const;

const LETTER_STATUS_TO_COLOR: Record<LETTER_STATUS, keyof typeof STATUS_COLORS> = {
  [LETTER_STATUS.IN_POSITION]: "success",
  [LETTER_STATUS.OUT_OF_POSITION]: "warning",
  [LETTER_STATUS.NOT_IN_WORD]: "error",
  [LETTER_STATUS.NOT_GUESSED]: "primary",
  [LETTER_STATUS.GUESSED]: "secondary",
} as const;

type LetterProps = {
  letter: string;
  position: LETTER_STATUS;
  index?: number;
};

const MotionTypography = motion(Typography);

const Letter = ({ letter, position, index = 0 }: LetterProps) => {
  const isEmpty = letter.trim() === '';
  const colorKey = LETTER_STATUS_TO_COLOR[position];
  
  return (
    <MotionTypography
      initial={{ scale: 0.9 }}
      animate={{ 
        scale: position === LETTER_STATUS.NOT_GUESSED ? 0.9 : 1,
        transition: {
          delay: index * 0.1,
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      whileHover={{ 
        scale: position === LETTER_STATUS.NOT_GUESSED ? 0.9 : 1.05,
        transition: { duration: 0.2 }
      }}
      sx={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid',
        borderColor: isEmpty ? 'divider' : STATUS_COLORS[colorKey],
        color: STATUS_COLORS[colorKey],
        borderRadius: 1,
        fontWeight: 'bold',
        fontSize: '1.25rem',
        bgcolor: isEmpty ? 'action.hover' : 'transparent',
      }}
    >
      {!isEmpty && toUpper(letter)}
    </MotionTypography>
  );
};

export default Letter;
