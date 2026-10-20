/**
 * Timezone-aware date utilities for Malaysian local time (or user's local device time).
 * Eliminates bugs caused by `new Date().toISOString().split('T')[0]`, which converts
 * local time to UTC and causes date shifts between 12:00 AM and 7:59 AM in GMT+8.
 */

/**
 * Returns the local date in YYYY-MM-DD format for a given Date object (defaults to now).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the local month in YYYY-MM format.
 */
export function getLocalMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Returns human-friendly date header ("Today", "Yesterday", or "Wed, 21 Oct").
 */
export function formatDisplayDate(dateStr: string): string {
  const today = getLocalDateString(new Date());
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateString(yesterdayDate);

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Computes the start date (inclusive) and next month date (exclusive) for a YYYY-MM string.
 * Used for rock-solid SQL range queries without crashing on months with 28/30 days.
 */
export function getMonthBounds(monthStr: string): { start: string; nextMonthStart: string } {
  const [yStr, mStr] = monthStr.split("-");
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);

  const start = `${monthStr}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return { start, nextMonthStart };
}
