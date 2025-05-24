"use client";

import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useState } from "react";
import SettingsDialog from "../SettingsDialog";
import { useConfigContext } from "../../providers/ConfigProvider";
import { useTheme } from "../../providers/ThemeProvider";

export default function Banner() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { config, saveConfig } = useConfigContext();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <>
      <AppBar 
        position="static" 
        color="default" 
        elevation={1}
        sx={{ 
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" fill="white"/>
              <rect x="4" y="4" width="24" height="24" rx="4" fill="#6AAA64" stroke="#4A8A44" strokeWidth="1"/>
              <path d="M10 8V24H22V20H14V8H10Z" fill="white"/>
            </svg>
          </Box>
          <Typography
            variant="h1"
            sx={{
              ml: 2,
              fontWeight: 'bold',
              fontSize: '2.5rem',
            }}
          >
            Lexi-Guess
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton 
            onClick={toggleTheme}
            size="large"
            sx={{ mr: 1 }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton 
            onClick={() => setSettingsOpen(true)}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentConfig={config}
        onSave={saveConfig}
      />
    </>
  );
} 