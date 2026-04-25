import {fetch as nitroFetch} from 'react-native-nitro-fetch';

import {env} from '../config/env';
import {Verse, VerseReflection, VerseTranslation} from '../content/verseTypes';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

type AnthropicMessage = {
  content: Array<{type: string; text?: string}>;
};

export async function translateVerse(verse: Verse): Promise<VerseTranslation> {
  const text = await callClaude(buildTranslationPrompt(verse), 700);
  const hindi = extractTag(text, 'hindi');
  const english = extractTag(text, 'english');

  if (!hindi || !english) {
    throw new Error('Translator returned an unexpected response shape.');
  }

  return {hindi, english, translatedAt: Date.now()};
}

export async function reflectOnVerse(verse: Verse): Promise<VerseReflection> {
  const text = await callClaude(buildReflectionPrompt(verse), 900);
  const theme = extractTag(text, 'theme');
  const reflection = extractTag(text, 'reflection');
  const practice = extractTag(text, 'practice');

  if (!theme || !reflection || !practice) {
    throw new Error('Reflection returned an unexpected response shape.');
  }

  return {theme, reflection, practice, reflectedAt: Date.now()};
}

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  if (!env.anthropicApiKey) {
    throw new Error(
      'Set env.anthropicApiKey in src/config/env.ts to enable this feature.',
    );
  }

  const response = await nitroFetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.anthropicModel,
      max_tokens: maxTokens,
      messages: [{role: 'user', content: prompt}],
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AnthropicMessage;
  return data.content
    .map(block => (block.type === 'text' ? block.text ?? '' : ''))
    .join('')
    .trim();
}

function buildTranslationPrompt(verse: Verse) {
  return [
    `You are a faithful translator of Hindu dharmic and yogic scripture.`,
    `Translate the following verse from ${verse.sourceLanguage} into (1) Hindi and (2) English.`,
    `Preserve the devotional register; do not paraphrase meaning away. Use clear modern Hindi and clear modern English.`,
    ``,
    `Reference: ${verse.reference}`,
    `Verse:`,
    verse.text,
    verse.transliteration ? `\nTransliteration:\n${verse.transliteration}` : '',
    ``,
    `Respond in this exact format, nothing else:`,
    `<hindi>...Hindi translation...</hindi>`,
    `<english>...English translation...</english>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildReflectionPrompt(verse: Verse) {
  return [
    `You are a thoughtful teacher in the Vedantic and yogic tradition.`,
    `Offer a short, grounded contemplation on this verse for a modern reader.`,
    `Avoid generic self-help language. Stay rooted in the verse's own claim.`,
    ``,
    `Reference: ${verse.reference}`,
    `Verse:`,
    verse.text,
    verse.transliteration ? `\nTransliteration:\n${verse.transliteration}` : '',
    ``,
    `Respond in this exact format, nothing else:`,
    `<theme>A 3-5 word theme</theme>`,
    `<reflection>A 3-4 sentence reflection that opens up the verse's meaning in today's life.</reflection>`,
    `<practice>One concrete practice or inquiry to carry through the day, in 1-2 sentences.</practice>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function extractTag(text: string, tag: string) {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return match?.[1]?.trim() ?? '';
}
