import test from "node:test";
import assert from "node:assert/strict";
import { localRepository } from "./local.ts";

test("storage repository returns default categories", async () => {
  const categories = await localRepository.getCategories();
  assert.ok(categories.length >= 8);
  const makan = categories.find((c) => c.name === "Makan & Minum");
  assert.ok(makan);
  assert.equal(makan.budget_sen, 80000); // RM 800
});

test("storage repository creates and queries expenses", async () => {
  const expense = await localRepository.createExpense({
    amount_sen: 1550, // RM 15.50
    category_id: "cat-1",
    category_name: "Makan & Minum",
    note: "Nasi Kandar lunch",
    spent_at: "2026-10-20",
  });

  assert.equal(expense.amount_sen, 1550);
  assert.equal(expense.note, "Nasi Kandar lunch");

  const list = await localRepository.getExpenses({ month: "2026-10" });
  assert.ok(list.some((e) => e.id === expense.id));
});

test("storage repository handles standalone debts and binary settlement", async () => {
  // 1. Create a Receivable (Who Owes Me)
  const debt = await localRepository.createDebt({
    type: "RECEIVABLE",
    person_name: "Hafiz",
    amount_sen: 5000, // RM 50.00
    note: "Badminton court rental share",
  });

  assert.equal(debt.type, "RECEIVABLE");
  assert.equal(debt.person_name, "Hafiz");
  assert.equal(debt.amount_sen, 5000);
  assert.equal(debt.status, "UNSETTLED");
  assert.equal(debt.settled_at, null);

  // 2. 1-click Settle
  const settled = await localRepository.toggleDebtStatus(debt.id, "UNSETTLED");
  assert.equal(settled.status, "SETTLED");
  assert.ok(settled.settled_at !== null);

  // 3. 1-click Reopen (if clicked by accident)
  const reopened = await localRepository.toggleDebtStatus(debt.id, "SETTLED");
  assert.equal(reopened.status, "UNSETTLED");
  assert.equal(reopened.settled_at, null);
});
