import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { LexiGuessConfig, Locale } from '@/app/components/config';

// Cache available words and track used words for each config
interface WordCache {
  availableWords: string[];
  usedWords: Set<string>;
}

const wordsCache = new Map<string, WordCache>();

const LANGUAGE_PROMPTS: Record<Locale, string> = {
  'EN': 'English',
  'PL': 'Polish',
};

function getCacheKey(config: LexiGuessConfig): string {
  const allowedChars = config.keyboardRows.flat().join('');
  return `${config.locale}-${config.maxWordLength}-${allowedChars}`;
}

async function generateWords(config: LexiGuessConfig): Promise<string[]> {
  console.log('🔄 Generating new words from OpenAI...');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const allowedChars = config.keyboardRows.flat().join('');
  const prompt = `Generate a list of 5 ${LANGUAGE_PROMPTS[config.locale]} words that are exactly ${config.maxWordLength} letters long.
Each word must only contain the following characters: ${allowedChars}.
The words should be common and well-known in ${LANGUAGE_PROMPTS[config.locale]}.
Return only the words in a comma-separated format, all in uppercase.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 500,
  });

  const response = completion.choices[0].message.content || '';
  const words = response
    .split(',')
    .map((word: string) => word.trim().toUpperCase())
    .filter((word: string) => {
      if (word.length !== config.maxWordLength) return false;
      return [...word].every(char => allowedChars.includes(char));
    });
  
  console.log('✨ Generated words:', words);
  return words;
}

async function getUnusedWord(config: LexiGuessConfig, cacheKey: string): Promise<string> {
  let cache = wordsCache.get(cacheKey);
  
  // If no cache exists, initialize it
  if (!cache) {
    console.log('🆕 No cache found. Initializing new cache...');
    const words = await generateWords(config);
    cache = {
      availableWords: words,
      usedWords: new Set()
    };
    wordsCache.set(cacheKey, cache);
  } else {
    console.log('📦 Found existing cache');
    console.log('   Available words:', cache.availableWords);
    console.log('   Used words:', Array.from(cache.usedWords));
  }

  // Try to find an unused word from the current list
  for (const word of cache.availableWords) {
    if (!cache.usedWords.has(word)) {
      cache.usedWords.add(word);
      console.log('✅ Found unused word from current list:', word);
      return word;
    }
  }

  console.log('⚠️ All current words have been used. Generating new list...');
  
  // If all words are used, generate a new list
  const newWords = await generateWords(config);
  cache.availableWords = newWords;
  
  // Find first unused word from new list
  for (const word of newWords) {
    if (!cache.usedWords.has(word)) {
      cache.usedWords.add(word);
      console.log('✅ Found unused word from new list:', word);
      return word;
    }
  }

  // If we still can't find an unused word (extremely unlikely), clear used words and start over
  console.log('⚠️ All words have been used. Clearing history and starting over...');
  cache.usedWords.clear();
  const word = newWords[0];
  cache.usedWords.add(word);
  console.log('✅ Using first word from new list:', word);
  return word;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const config = JSON.parse(searchParams.get('config') || '{}') as LexiGuessConfig;
    
    if (!config.locale || !config.maxWordLength || !config.keyboardRows) {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
    }

    const cacheKey = getCacheKey(config);
    console.log('🔑 Cache key:', cacheKey);
    
    const word = await getUnusedWord(config, cacheKey);
    console.log('📝 Final selected word:', word);
    return NextResponse.json({ word });

  } catch (error) {
    console.error('❌ Error generating words:', error);
    return NextResponse.json(
      { error: 'Failed to generate words' },
      { status: 500 }
    );
  }
} 