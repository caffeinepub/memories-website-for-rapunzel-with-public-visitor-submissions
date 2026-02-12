/**
 * Format a bigint timestamp (nanoseconds) to a human-friendly date string
 */
export function formatTimestamp(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(timestamp) / 1000000;
  const date = new Date(milliseconds);

  // Format as "Jan 12, 2026"
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
