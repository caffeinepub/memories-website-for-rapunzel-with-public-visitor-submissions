/**
 * Convert a File to Uint8Array for backend upload
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert Uint8Array to Data URL for audio playback
 * Attempts to guess MIME type from filename extension
 */
export function uint8ArrayToDataUrl(bytes: Uint8Array, fileName: string): string {
  const mimeType = guessMimeType(fileName);
  // Create a new ArrayBuffer and copy the data to ensure proper typing
  const buffer = new ArrayBuffer(bytes.byteLength);
  const view = new Uint8Array(buffer);
  view.set(bytes);
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Guess MIME type from file extension
 */
function guessMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const mimeMap: Record<string, string> = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'oga': 'audio/ogg',
    'opus': 'audio/opus',
    'webm': 'audio/webm',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4',
    'mp4': 'audio/mp4',
  };

  return mimeMap[ext || ''] || 'audio/mpeg';
}
