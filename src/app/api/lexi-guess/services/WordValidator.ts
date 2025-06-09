import { GuessResult, WordValidator as IWordValidator } from '../types';
import { LETTER_STATUS } from '@/app/components/types';
import logger from '@/app/lib/logger';

export class WordValidator implements IWordValidator {
  validateGuess(guess: string, answer: string): GuessResult {
    logger.debug('🎯 Starting guess validation', { guess, answer });
    
    const upperGuess = guess.toUpperCase();
    const upperAnswer = answer.toUpperCase();
    logger.debug('📝 Normalized inputs', { upperGuess, upperAnswer });
    
    const positionStatuses: Record<string, LETTER_STATUS> = {};
    const unmatchedGuessIndices: number[] = [];
    const unmatchedAnswerLetters = new Map<string, number>();

    // Initialize all positions as NOT_IN_WORD and process exact matches in a single pass
    for (let i = 0; i < upperGuess.length; i++) {
      const guessLetter = upperGuess[i];
      const answerLetter = upperAnswer[i];

      // Count all letters in answer for unmatched positions
      if (guessLetter !== answerLetter) {
        unmatchedGuessIndices.push(i);
        unmatchedAnswerLetters.set(
          answerLetter, 
          (unmatchedAnswerLetters.get(answerLetter) || 0) + 1
        );
        positionStatuses[i] = LETTER_STATUS.NOT_IN_WORD;
      } else {
        // Mark exact matches immediately
        positionStatuses[i] = LETTER_STATUS.IN_POSITION;
        logger.debug('✅ Found exact match', { position: i, letter: guessLetter });
      }
    }

    // Process unmatched positions for partial matches
    for (const i of unmatchedGuessIndices) {
      const guessLetter = upperGuess[i];
      const remainingCount = unmatchedAnswerLetters.get(guessLetter) || 0;

      if (remainingCount > 0) {
        positionStatuses[i] = LETTER_STATUS.OUT_OF_POSITION;
        unmatchedAnswerLetters.set(guessLetter, remainingCount - 1);
        logger.debug('↔️ Found misplaced letter', { 
          position: i, 
          letter: guessLetter, 
          remainingCount: remainingCount - 1 
        });
      } else {
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
      positionStatuses,
      result
    });

    return result;
  }
} 