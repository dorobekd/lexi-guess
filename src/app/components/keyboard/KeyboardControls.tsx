import { Box, Button } from "@mui/material";

type KeyboardControlsProps = {
  onBackspace: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
};

export default function KeyboardControls({
  onBackspace,
  onSubmit,
  isSubmitDisabled
}: KeyboardControlsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
      <Button onClick={onBackspace} sx={{ px: 2 }}>
        Backspace
      </Button>
      <Button 
        onClick={onSubmit} 
        sx={{ px: 2 }} 
        disabled={isSubmitDisabled}
      >
        Submit
      </Button>
    </Box>
  );
} 