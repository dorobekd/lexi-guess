"use client";
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const MotionSkeleton = motion(Skeleton);

type LoadingPlaceholderProps = {
  wordRows?: number;
  keyboardRows?: number;
};

export default function LoadingPlaceholder({ 
  wordRows = 6, 
  keyboardRows = 3 
}: LoadingPlaceholderProps) {
  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4
    }}>
      {/* Word Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', maxWidth: 300 }}>
        {Array.from({ length: wordRows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <MotionSkeleton
                key={j}
                variant="rectangular"
                width={40}
                height={40}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 0.7 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1,
                  delay: (i * 5 + j) * 0.05
                }}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* Keyboard */}
      <Box sx={{ 
        width: '100%',
        maxWidth: 600,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2
      }}>
        {Array.from({ length: keyboardRows }).map((_, i) => (
          <Box 
            key={i} 
            sx={{ 
              display: 'flex', 
              gap: 0.5,
              justifyContent: 'center',
              mx: 'auto',
              width: '100%',
              '&:nth-of-type(2)': { pl: 4 }
            }}
          >
            {Array.from({ length: i === 1 ? 9 : i === 2 ? 9 : 10 }).map((_, j) => (
              <MotionSkeleton
                key={j}
                variant="rectangular"
                width={i === 2 && (j === 0 || j === 8) ? 72 : 40}
                height={40}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 0.7 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1,
                  delay: (i * 10 + j) * 0.05
                }}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
} 