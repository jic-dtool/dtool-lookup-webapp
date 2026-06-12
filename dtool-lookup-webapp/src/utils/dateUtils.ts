// dateUtils.ts
//
// Lightweight date formatting helpers (replacement for moment.js).

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Format a Unix timestamp (seconds) as e.g. "Jun 10, 2026".
 */
export function formatDate(unixSeconds: number): string {
  return DATE_FORMAT.format(new Date(unixSeconds * 1000));
}

/**
 * Format a Unix timestamp (seconds) as e.g. "2026-06-10 18:30" (local time).
 */
export function formatDateTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
