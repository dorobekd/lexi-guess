import { useEffect, useState } from 'react';
import AnimatedButton from '../common/AnimatedButton';
import AnimatedModal from './AnimatedModal';
import AnimatedTitle from './AnimatedTitle';

type VictoryModalProps = {
  open: boolean;
  onClose?: () => void;
  guessCount: number;
};

export default function VictoryModal({ open, onClose, guessCount }: VictoryModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [open]);

  const victoryText = `Victory in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`;

  const titleComponent = (
    <AnimatedTitle
      text={victoryText}
      animate={animate}
      variant="shake"
      color="success"
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