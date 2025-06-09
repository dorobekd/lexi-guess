import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { LexiGuessConfig, DEFAULT_CONFIG, GameMode } from './config';
import { useState } from 'react';

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  currentConfig: LexiGuessConfig | null;
  onSave: (config: LexiGuessConfig) => Promise<void>;
};

export default function SettingsDialog({ 
  open, 
  onClose, 
  currentConfig,
  onSave 
}: SettingsDialogProps) {
  const [config, setConfig] = useState<LexiGuessConfig>(currentConfig  ?? DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleGameModeChange = (value: string) => {
    setConfig(prev => ({
      ...prev,
      gameMode: value as GameMode
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Game Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Word Length"
            type="number"
            value={config.maxWordLength}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              maxWordLength: Math.max(1, parseInt(e.target.value) || 1)
            }))}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Maximum Guesses"
            type="number"
            value={config.maxGuesses}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              maxGuesses: Math.max(1, parseInt(e.target.value) || 1)
            }))}
            inputProps={{ min: 1 }}
          />
          <FormControl fullWidth>
            <InputLabel>Game Mode</InputLabel>
            <Select
              value={config.gameMode}
              label="Game Mode"
              onChange={(e) => handleGameModeChange(e.target.value)}
            >
              <MenuItem value="daily">Daily Challenge</MenuItem>
              <MenuItem value="practice">Practice</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 