import { Typography, SxProps, Theme, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { STATUS_COLORS } from '../word/Letter';
import { toUpper } from 'lodash-es';

type AnimationVariant = 'shake' | 'bounce';

type AnimatedTitleProps = {
  text: string;
  color: keyof typeof STATUS_COLORS;
  variant?: AnimationVariant;
  animate?: boolean;
  sx?: SxProps<Theme>;
};

const MotionTypography = motion(Typography);

const animations = {
  shake: {
    animate: {
      x: [0, -20, 20, -20, 20, -20, 20, -20, 20, -20, 0],
    },
    transition: {
      duration: 1.2,
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      ease: "easeInOut",
    }
  },
  bounce: {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
    },
    transition: {
      duration: 0.8,
      ease: "easeOut",
    }
  }
};

export default function AnimatedTitle({ 
  text,
  color,
  variant = 'bounce',
  animate = false,
  sx = {}
}: AnimatedTitleProps) {
  return (
    <MotionTypography
      variant="h4"
      align="center"
      animate={animate ? animations[variant].animate : {}}
      transition={animate ? animations[variant].transition : {}}
      sx={{ 
        display: 'flex', 
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 1,
        flexWrap: 'nowrap',
        fontWeight: 'bold',
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {text.split('').map((letter, index) => (
          letter === ' ' ? (
            <Box key={index} sx={{ width: 8 }} /> // Space between words
          ) : (
            <Box
              key={index}
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: STATUS_COLORS[color],
                color: STATUS_COLORS[color],
                borderRadius: 1,
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              {toUpper(letter)}
            </Box>
          )
        ))}
      </Box>
    </MotionTypography>
  );
} 