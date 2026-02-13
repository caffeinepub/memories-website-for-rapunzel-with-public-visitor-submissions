// Static lock screen background for Version 21
// No rotation or multi-variant behavior

export interface BackgroundVariant {
  gradient: string;
  imageUrl?: string;
  overlayOpacity: number;
}

const STATIC_BACKGROUND: BackgroundVariant = {
  gradient: 'linear-gradient(135deg, oklch(0.85 0.08 60) 0%, oklch(0.75 0.12 40) 50%, oklch(0.65 0.10 30) 100%)',
  overlayOpacity: 0.3,
};

export function getBackgroundByIndex(_index: number): BackgroundVariant {
  return STATIC_BACKGROUND;
}

export function getTotalBackgrounds(): number {
  return 1;
}
