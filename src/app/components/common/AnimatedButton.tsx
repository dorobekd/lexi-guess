import { Button, ButtonProps } from '@mui/material';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

const MotionButton = motion(Button);

type AnimatedButtonProps = Omit<ButtonProps, keyof HTMLMotionProps<"button">> & {
  delay?: number;
  children: ReactNode;
  onClick?: () => void;
};

export default function AnimatedButton({ 
  children, 
  delay = 0,
  onClick,
  ...buttonProps 
}: AnimatedButtonProps) {
  return (
    <MotionButton
      fullWidth
      variant="outlined"
      color="primary"
      size="large"
      onClick={onClick}
      {...buttonProps}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay,
        duration: 0.3,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      sx={{
        border: '2px solid',
      }}
    >
      {children}
    </MotionButton>
  );
} 