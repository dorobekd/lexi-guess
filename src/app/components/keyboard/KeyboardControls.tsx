import { Box } from "@mui/material";
import AnimatedButton from "../common/AnimatedButton";

type KeyboardControlsProps = {
  onBackspace: () => void;
  onSubmit: () => void;
  isBackspaceDisabled: boolean;
  isSubmitDisabled: boolean;
};

export default function KeyboardControls({
  onBackspace,
  onSubmit,
  isBackspaceDisabled,
  isSubmitDisabled
}: KeyboardControlsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
      <AnimatedButton
        onClick={onBackspace} 
        disabled={isBackspaceDisabled}
      >
        BACK
      </AnimatedButton>
      <AnimatedButton
        onClick={onSubmit} 
        disabled={isSubmitDisabled}
      >
        ENTER
      </AnimatedButton>
    </Box>
  );
} 