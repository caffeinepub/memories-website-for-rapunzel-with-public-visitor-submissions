// Static phrase for Version 21 lock screen
// No rotation or dynamic behavior

const STATIC_PHRASE = "Every moment is a thread in the tapestry of memory";

export function getPhraseByIndex(_index: number): string {
  return STATIC_PHRASE;
}

export function getTotalPhrases(): number {
  return 1;
}

export function getRandomPhrase(): string {
  return STATIC_PHRASE;
}
