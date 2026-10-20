/**
 * Money utilities for Malaysian Ringgit (MYR).
 *
 * In accordance with GLOSSARY.md, all currency calculations and storage
 * are handled strictly in integer Sen (1 RM = 100 Sen) to eliminate
 * floating-point rounding errors.
 */

/**
 * Converts a decimal RM amount or numeric string into integer Sen.
 * e.g., 12.50 -> 1250, "1,250.75" -> 125075
 */
export function toSen(amount: number | string): number {
  if (typeof amount === "number") {
    if (isNaN(amount) || !isFinite(amount)) return 0;
    // Use Number.EPSILON to avoid floating point precision edge cases like 1.005
    return Math.round((amount + Number.EPSILON) * 100);
  }

  if (typeof amount === "string") {
    const cleaned = amount
      .replace(/RM/gi, "")
      .replace(/,/g, "")
      .trim();

    if (!cleaned) return 0;

    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || !isFinite(parsed)) return 0;

    return Math.round((parsed + Number.EPSILON) * 100);
  }

  return 0;
}

/**
 * Converts integer Sen into decimal RM.
 * e.g., 1250 -> 12.5
 */
export function fromSen(sen: number): number {
  if (isNaN(sen) || !isFinite(sen)) return 0;
  return sen / 100;
}

/**
 * Formats integer Sen into a human-readable Malaysian Ringgit string.
 * e.g., 125000 -> "RM 1,250.00"
 */
export function formatMYR(
  sen: number,
  options: { showPrefix?: boolean } = { showPrefix: true }
): string {
  const rm = fromSen(sen);
  const formatted = new Intl.NumberFormat("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rm);

  return options.showPrefix ? `RM ${formatted}` : formatted;
}

/**
 * Parses raw text input into integer Sen, with validation feedback.
 */
export function parseMYRInput(
  input: string
): { success: true; sen: number } | { success: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, error: "Amount is required" };
  }

  const cleaned = trimmed.replace(/RM/gi, "").replace(/,/g, "").trim();
  const parsed = Number(cleaned);

  if (isNaN(parsed) || !isFinite(parsed)) {
    return { success: false, error: "Please enter a valid amount" };
  }

  if (parsed <= 0) {
    return { success: false, error: "Amount must be greater than zero" };
  }

  if (parsed > 100_000_000) {
    return { success: false, error: "Amount is too large" };
  }

  return { success: true, sen: toSen(parsed) };
}
