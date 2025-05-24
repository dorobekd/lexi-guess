import { useEffect, useState } from 'react';
import AnimatedButton from '../common/AnimatedButton';
import AnimatedModal from './AnimatedModal';
import AnimatedTitle from './AnimatedTitle';

type GameOverModalProps = {
  open: boolean;
  onClose?: () => void;
};

export default function GameOverModal({ open, onClose }: GameOverModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [open]);

  const gameOverText = 'Out of Guesses!';

  const titleComponent = (
    <AnimatedTitle
      text={gameOverText}
      animate={animate}
      variant="shake"
      color="error"
    />
  );

  return (
    <AnimatedModal
      open={open}
      titleComponent={titleComponent}
    >
      <AnimatedButton
        onClick={onClose}
        delay={1.5}
      >
        Play Again
      </AnimatedButton>
    </AnimatedModal>
  );
} 