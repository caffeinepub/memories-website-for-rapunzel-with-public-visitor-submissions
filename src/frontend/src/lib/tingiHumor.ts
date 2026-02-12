import type { SearchResult } from './googleCustomSearch';

const GREETINGS = [
  "Ooh, let me dig into the internet's treasure chest! 🎁",
  "Hold on, consulting my crystal ball... er, Google! 🔮",
  "Searching the vast digital ocean for you! 🌊",
  "Let me put on my detective hat! 🕵️",
  "Firing up the search engines! 🚀",
];

const INTROS = [
  "Alrighty, here's what I found:",
  "Well well well, look what turned up:",
  "Aha! The internet says:",
  "Drumroll please... 🥁",
  "Brace yourself for knowledge:",
  "Hot off the digital press:",
];

const NO_RESULTS_MESSAGES = [
  "Hmm, even Google is scratching its head on this one! 🤔",
  "The internet is mysteriously silent about that... spooky! 👻",
  "I searched high and low, but came up empty-handed! 🤷",
  "Not even the all-knowing Google knows about that! 🙈",
  "That's a tough one! Maybe try rephrasing? 🤔",
];

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getGreeting(): string {
  return pickRandom(GREETINGS);
}

export function generateFunnySummary(results: SearchResult[]): string {
  if (results.length === 0) {
    return pickRandom(NO_RESULTS_MESSAGES);
  }

  const intro = pickRandom(INTROS);
  const topResult = results[0];
  
  // Create a playful summary using the top result
  const snippetPreview = topResult.snippet.length > 120 
    ? topResult.snippet.substring(0, 120) + '...' 
    : topResult.snippet;

  return `${intro}\n\n"${snippetPreview}"\n\n${getPlayfulEnding(results.length)}`;
}

function getPlayfulEnding(resultCount: number): string {
  const endings = [
    `Found ${resultCount} more gems if you want to dive deeper! 💎`,
    `Plus ${resultCount - 1} more results to explore! 🔍`,
    `That's just the tip of the iceberg—${resultCount} results total! 🧊`,
    `And there's ${resultCount - 1} more where that came from! 📚`,
    `Got ${resultCount} results in total. You're welcome! 😎`,
  ];
  return pickRandom(endings);
}

export function getErrorMessage(error: string): string {
  const funnyErrors: Record<string, string> = {
    'quota': "Oops! We've hit Google's daily limit. Come back tomorrow! 📅",
    'invalid': "Hmm, those API credentials look fishy... 🐟",
    'network': "The internet seems to be playing hide and seek! 🙈",
    'restricted': "Google says 'access denied'—maybe check those API settings? 🔐",
  };

  for (const [key, message] of Object.entries(funnyErrors)) {
    if (error.toLowerCase().includes(key)) {
      return message;
    }
  }

  return `Whoops! ${error} 🤷`;
}
