import { GuessResult, WordValidator as IWordValidator } from '../types';
import { LETTER_STATUS } from '@/app/components/types';
import { logger } from '@/lib/clientLogger';

export class WordValidator implements IWordValidator {
  validateGuess(guess: string, answer: string): GuessResult {
    logger.debug('🎯 Starting guess validation', { guess, answer });
    
    const upperGuess = guess.toUpperCase();
    const upperAnswer = answer.toUpperCase();
    logger.debug('📝 Normalized inputs', { upperGuess, upperAnswer });
    
    const positionStatuses: Record<string, LETTER_STATUS> = {};
    const guessArray = upperGuess.split('');
    const answerArray = upperAnswer.split('');

    // Initialize all positions as NOT_IN_WORD
    for (let i = 0; i < guessArray.length; i++) {
      positionStatuses[i.toString()] = LETTER_STATUS.NOT_IN_WORD;
    }

    // Count letters in answer
    const answerLetterCount = new Map<string, number>();
    for (const letter of answerArray) {
      answerLetterCount.set(letter, (answerLetterCount.get(letter) || 0) + 1);
    }
    logger.debug('📊 Answer letter counts', { counts: Object.fromEntries(answerLetterCount) });

    // First pass: Mark exact matches (IN_POSITION)
    for (let i = 0; i < guessArray.length; i++) {
      const guessLetter = guessArray[i];
      if (guessLetter === answerArray[i]) {
        positionStatuses[i.toString()] = LETTER_STATUS.IN_POSITION;
        // Decrement the count for this letter
        answerLetterCount.set(guessLetter, answerLetterCount.get(guessLetter)! - 1);
        logger.debug('✅ Found exact match', { 
          position: i, 
          letter: guessLetter, 
          remainingCount: answerLetterCount.get(guessLetter) 
        });
      }
    }

    // Second pass: Mark misplaced letters (OUT_OF_POSITION)
    // For duplicate letters in guess, we need to process from left to right
    for (let i = 0; i < guessArray.length; i++) {
      const pos = i.toString();
      // Skip positions that are already marked as exact matches
      if (positionStatuses[pos] === LETTER_STATUS.IN_POSITION) {
        continue;
      }

      const guessLetter = guessArray[i];
      const remainingCount = answerLetterCount.get(guessLetter) || 0;

      // If we still have instances of this letter available in the answer
      if (remainingCount > 0) {
        positionStatuses[pos] = LETTER_STATUS.OUT_OF_POSITION;
        answerLetterCount.set(guessLetter, remainingCount - 1);
        logger.debug('↔️ Found misplaced letter', { 
          position: i, 
          letter: guessLetter, 
          remainingCount: answerLetterCount.get(guessLetter) 
        });
      } else {
        // No more instances of this letter available
        logger.debug('❌ No more instances available', { 
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
      availableLetters: Object.fromEntries(answerLetterCount),
      result
    });

    return result;
  }
} 