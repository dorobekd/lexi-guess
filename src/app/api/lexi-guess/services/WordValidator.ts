import { withRequestContext } from '@/lib/logger';
import { GuessResult, WordValidator as IWordValidator } from '../types';
import { LETTER_STATUS } from '@/app/components/types';

export class WordValidator implements IWordValidator {
  async validateGuess(guess: string, answer: string): Promise<GuessResult> {
    return withRequestContext({ service: 'WordValidator' }, async (logger) => {
      logger.debug('🎯 Starting guess validation', { guess, answer });
      
      const upperGuess = guess.toUpperCase();
      const upperAnswer = answer.toUpperCase();
      logger.debug('📝 Normalized inputs', { upperGuess, upperAnswer });

      const length = upperGuess.length;
      const letterCounts: Record<string, number> = {};
      const positionStatuses: Record<number, LETTER_STATUS> = {};

      // First count all letters in answer
      for (const letter of upperAnswer) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      }

      // First pass: mark exact matches
      for (let i = 0; i < length; i++) {
        const guessLetter = upperGuess[i];
        const answerLetter = upperAnswer[i];

        if (guessLetter === answerLetter) {
          positionStatuses[i] = LETTER_STATUS.IN_POSITION;
          letterCounts[guessLetter]--; // Decrease available count
          logger.debug('✅ Found exact match', { position: i, letter: guessLetter });
        } else if (letterCounts[guessLetter] > 0) {
          // Letter exists in answer but in wrong position
          positionStatuses[i] = LETTER_STATUS.OUT_OF_POSITION;
          letterCounts[guessLetter]--; // Decrease available count
          logger.debug('↔️ Found misplaced letter', { 
            position: i, 
            letter: guessLetter, 
            remainingCount: letterCounts[guessLetter] 
          });
        } else {
          // Letter not in word or no more instances available
          positionStatuses[i] = LETTER_STATUS.NOT_IN_WORD;
          logger.debug('❌ Letter not in remaining positions', { 
            position: i, 
            letter: guessLetter 
          });
        }
      }

      const result = {
        correct: upperGuess === upperAnswer,
        letterStatuses: positionStatuses
      };

      logger.debug('🎲 Final validation result', { 
        guess: upperGuess,
        answer: upperAnswer,
        result 
      });

      return result;
    });
  }
} 