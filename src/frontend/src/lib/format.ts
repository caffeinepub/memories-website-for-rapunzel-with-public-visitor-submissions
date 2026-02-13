/**
 * Format a bigint timestamp (nanoseconds) to a human-friendly date and time string
 */
export function formatTimestamp(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(timestamp) / 1000000;
  const date = new Date(milliseconds);

  // Format as "Jan 12, 2026 at 3:45 PM"
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
