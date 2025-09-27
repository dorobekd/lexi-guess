import LexiGuessContainer from '@/features/game/components/container/LexiGuessContainer';
import Banner from '@/features/game/components/common/Banner';
import { Box } from '@mui/material';

export default function Home() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Banner />
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 3,
        width: '100%'
      }}>
        <LexiGuessContainer />
      </Box>
    </Box>
  );
}
