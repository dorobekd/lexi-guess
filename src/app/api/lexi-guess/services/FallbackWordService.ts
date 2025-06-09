import { LexiGuessConfig } from '@/app/components/config';
import { WordGenerator, GeneratedWords } from '../types';
import { shuffle } from 'lodash';

type WordsByLength = {
  [length: number]: string[];
};

const FALLBACK_WORDS: Record<'EN' | 'PL', WordsByLength> = {
  'EN': {
    4: [
      'ABLE', 'BABY', 'CALM', 'DARK', 'EASY',
      'FISH', 'GOOD', 'HELP', 'IDEA', 'JUMP',
      'KIND', 'LOVE', 'MIND', 'NICE', 'OPEN',
      'PLAY', 'QUIT', 'READ', 'SING', 'TIME'
    ],
    5: [
      'APPLE', 'BEACH', 'CLOUD', 'DANCE', 'EARTH',
      'FLAME', 'GRACE', 'HAPPY', 'IVORY', 'JUICE',
      'KNOTS', 'LEMON', 'MUSIC', 'NIGHT', 'OCEAN',
      'PEACE', 'QUEEN', 'RIVER', 'SMILE', 'THINK'
    ],
    6: [
      'ACTION', 'BEAUTY', 'CHANGE', 'DESIGN', 'ENERGY',
      'FAMILY', 'GARDEN', 'HEALTH', 'IMPACT', 'JUNGLE',
      'KNIGHT', 'LEADER', 'MEMORY', 'NATURE', 'ORANGE',
      'PEOPLE', 'QUIET', 'REASON', 'SIMPLE', 'TRAVEL'
    ],
    7: [
      'AMAZING', 'BALANCE', 'COMFORT', 'DIAMOND', 'ELEGANT',
      'FREEDOM', 'GENUINE', 'HARMONY', 'INSPIRE', 'JOURNEY',
      'KINDRED', 'LOGICAL', 'MYSTERY', 'NATURAL', 'ORGANIC',
      'PERFECT', 'QUALITY', 'RESPECT', 'SILENCE', 'THOUGHT'
    ],
    8: [
      'ABSOLUTE', 'BEAUTIFUL', 'CREATIVE', 'DELICATE', 'ENERGETIC',
      'FRIENDLY', 'GRACEFUL', 'HARMONIC', 'INFINITE', 'JOYFULLY',
      'KINDNESS', 'LAUGHTER', 'MAGNETIC', 'NATURAL', 'ORIGINAL',
      'PEACEFUL', 'QUALITY', 'RAINBOW', 'SILENCE', 'TOGETHER'
    ]
  },
  'PL': {
    4: [
      'CZAS', 'DOM', 'FALA', 'GÓRA', 'KAWA',
      'LATO', 'MAPA', 'NOGA', 'OKNO', 'PIES',
      'RAMA', 'SALA', 'TATA', 'WODA', 'ZONA',
      'RUCH', 'SENS', 'TLEN', 'WIEK', 'ZNAK'
    ],
    5: [
      'BIALY', 'CZARY', 'DROGA', 'FAJNY', 'GLOWA',
      'JASNY', 'KOLOR', 'LAMPA', 'MLODY', 'NIEBO',
      'OBRAZ', 'PRACA', 'RADIO', 'SLOWO', 'TANIEC',
      'ULICA', 'WIATR', 'ZAMEK', 'ZEGAR', 'KWIAT'
    ],
    6: [
      'AKCENT', 'BALKON', 'CHMURA', 'DRZEWO', 'EKRAN',
      'FRYZUR', 'GITARA', 'HANDEL', 'ISKIER', 'JEZYK',
      'KAMERA', 'LAMPER', 'MIASTO', 'NATURA', 'OBIAD',
      'PROSTO', 'RADOSC', 'SLONCE', 'TANCZY', 'ULOTKA'
    ],
    7: [
      'APTEKA', 'BALWAN', 'CEBULA', 'DRABINA', 'EKOLOGIA',
      'FORTUNA', 'GWIAZDA', 'HERBATA', 'IMPREZA', 'JABLKO',
      'KAPUSTA', 'LATARKA', 'MALINA', 'NADZIEJA', 'OKULARY',
      'PACZKA', 'RAKIETA', 'SERWETA', 'TABLICA', 'UBRANIE'
    ],
    8: [
      'AKADEMIA', 'BANDANA', 'CZEKOLAD', 'DZIALANIE', 'EKSPRES',
      'FANTAZJA', 'GITAROWY', 'HORYZONT', 'IMIENINY', 'JABLECZNIK',
      'KALENDARZ', 'LATARNIA', 'MALOWAC', 'NADZIEJA', 'OKULARNIK',
      'PATELNIA', 'ROWEROWY', 'SAMOCHOD', 'TELEWIZOR', 'UCZCIWY'
    ]
  }
} as const;

export class FallbackWordService implements WordGenerator {
  public async generateWords(config: LexiGuessConfig): Promise<GeneratedWords> {
    const wordsByLength = FALLBACK_WORDS[config.locale][config.maxWordLength];
    if (!wordsByLength) {
      throw new Error(`No fallback words available for length: ${config.maxWordLength}`);
    }

    const allowedChars = config.keyboardRows.flat().join('');

    // Filter words that match the allowed characters and shuffle them
    const validWords = shuffle(
      wordsByLength.filter(word => 
        [...word].every(char => allowedChars.includes(char))
      )
    );

    if (validWords.length === 0) {
      throw new Error('No valid fallback words available for the current keyboard configuration');
    }

    return {
      words: validWords,
      source: 'fallback'
    };
  }
} 