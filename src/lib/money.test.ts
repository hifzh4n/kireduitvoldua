import test from "node:test";
import assert from "node:assert/strict";
import { toSen, fromSen, formatMYR, parseMYRInput } from "./money.ts";

test("toSen converts number to integer Sen", () => {
  assert.equal(toSen(0), 0);
  assert.equal(toSen(0.01), 1);
  assert.equal(toSen(0.1), 10);
  assert.equal(toSen(1), 100);
  assert.equal(toSen(12.5), 1250);
  assert.equal(toSen(12.55), 1255);
  assert.equal(toSen(999.99), 99999);
  // floating point inaccuracy avoidance
  assert.equal(toSen(19.99), 1999);
  assert.equal(toSen(1.005), 101);
});

test("toSen converts formatted string to integer Sen", () => {
  assert.equal(toSen("12.50"), 1250);
  assert.equal(toSen("RM 12.50"), 1250);
  assert.equal(toSen("1,250.75"), 125075);
  assert.equal(toSen("RM 1,250.75"), 125075);
  assert.equal(toSen(""), 0);
  assert.equal(toSen("invalid"), 0);
});

test("fromSen converts integer Sen to decimal RM", () => {
  assert.equal(fromSen(0), 0);
  assert.equal(fromSen(100), 1);
  assert.equal(fromSen(1250), 12.5);
  assert.equal(fromSen(1255), 12.55);
});

test("formatMYR outputs correct Malaysian Ringgit format", () => {
  assert.equal(formatMYR(0), "RM 0.00");
  assert.equal(formatMYR(50), "RM 0.50");
  assert.equal(formatMYR(1250), "RM 12.50");
  assert.equal(formatMYR(125000), "RM 1,250.00");
  assert.equal(formatMYR(100000000), "RM 1,000,000.00");
  assert.equal(formatMYR(1250, { showPrefix: false }), "12.50");
});

test("parseMYRInput validates user inputs accurately", () => {
  assert.deepEqual(parseMYRInput("12.50"), { success: true, sen: 1250 });
  assert.deepEqual(parseMYRInput("RM 50"), { success: true, sen: 5000 });
  assert.deepEqual(parseMYRInput("  1,500.25 "), { success: true, sen: 150025 });

  const empty = parseMYRInput("");
  assert.equal(empty.success, false);

  const zero = parseMYRInput("0");
  assert.equal(zero.success, false);

  const negative = parseMYRInput("-10");
  assert.equal(negative.success, false);

  const gibberish = parseMYRInput("abc");
  assert.equal(gibberish.success, false);
});
