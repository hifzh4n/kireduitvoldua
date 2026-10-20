# 02: Supabase Schema and Storage Repository Layer

**What to build:**
Create the full `supabase/schema.sql` database migration script for Supabase (defining `categories`, `expenses`, and `debts` with constraints and indexes). Build a unified TypeScript repository layer that talks to Supabase via `@supabase/supabase-js`, with an automatic transparent local fallback to `localStorage` when `.env.local` credentials are not present.

**Blocked by:** 01: Project Setup and Money Domain Math

**Status:** resolved

- [x] Complete `supabase/schema.sql` ready to paste into Supabase SQL Editor
- [x] TypeScript types for Category, Expense, Debt (`RECEIVABLE` | `PAYABLE`, `UNSETTLED` | `SETTLED`)
- [x] Unified storage repository interface (`getExpenses`, `addExpense`, `deleteExpense`, `getDebts`, `addDebt`, `settleDebt`, `getCategories`, `saveCategoryBudget`)
- [x] Seamless fallback adapter for local testing when Supabase keys are empty
- [x] Verification tests for storage operations
