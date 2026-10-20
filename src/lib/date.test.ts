import test from "node:test";
import assert from "node:assert/strict";
import { getLocalDateString, getLocalMonthString, formatDisplayDate, getMonthBounds } from "./date.ts";

test("getLocalDateString returns YYYY-MM-DD", () => {
  const d = new Date(2026, 9, 20); // October 20, 2026
  assert.equal(getLocalDateString(d), "2026-10-20");
});

test("getLocalMonthString returns YYYY-MM", () => {
  const d = new Date(2026, 1, 5); // Feb 5, 2026
  assert.equal(getLocalMonthString(d), "2026-02");
});

test("getMonthBounds computes accurate start and next month boundary", () => {
  // Regular month
  const oct = getMonthBounds("2026-10");
  assert.equal(oct.start, "2026-10-01");
  assert.equal(oct.nextMonthStart, "2026-11-01");

  // February (avoids invalid Feb 31!)
  const feb = getMonthBounds("2026-02");
  assert.equal(feb.start, "2026-02-01");
  assert.equal(feb.nextMonthStart, "2026-03-01");

  // Year boundary (December to January)
  const dec = getMonthBounds("2026-12");
  assert.equal(dec.start, "2026-12-01");
  assert.equal(dec.nextMonthStart, "2027-01-01");
});

test("formatDisplayDate recognizes today", () => {
  const todayStr = getLocalDateString(new Date());
  assert.equal(formatDisplayDate(todayStr), "Today");
});
