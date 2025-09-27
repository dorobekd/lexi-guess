import { Modal, Paper, Backdrop, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AnimatedModalProps = {
  open: boolean;
  children: ReactNode;
  titleComponent?: ReactNode;
  contentSx?: SxProps<Theme>;
};

const MotionPaper = motion(Paper);

export default function AnimatedModal({ 
  open, 
  children,
  titleComponent,
  contentSx
}: AnimatedModalProps) {
  return (
    <Modal
      open={open}
      onClose={undefined}
      closeAfterTransition
      disableEscapeKeyDown
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.7)',
          }
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence>
        {open && (
          <MotionPaper
            elevation={8}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            sx={{
              py: 4,
              px: 6,
              borderRadius: 2,
              bgcolor: 'background.paper',
              outline: 'none',
              position: 'relative',
              minWidth: 300,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              ...contentSx
            }}
          >
            {titleComponent}
            {children}
          </MotionPaper>
        )}
      </AnimatePresence>
    </Modal>
  );
} 