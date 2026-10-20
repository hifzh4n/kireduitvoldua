# Spec: Personal Money Tracker (Expenses & Standalone Debts)

## Problem Statement

Managing personal day-to-day finances often suffers from two opposing extremes: complicated full-blown accounting apps that demand double-entry bookkeeping, or over-hyped "AI" finance dashboards with useless widgets, slow interfaces, and generic gradients.
The user needs a fast, calm, distraction-free money tracker for daily personal expenses in Malaysian Ringgit (MYR), paired with a clear, standalone way to track debts—specifically who owes them money and who they owe—with zero login friction and 1-click settlements.

## Solution

A high-density Next.js web application built with a calm, tactile aesthetic (no AI slop, no neon gradients, crisp tabular numbers, slate/paper tones).
The system tracks:
1. **Expenses**: Fast daily spending records categorized under customizable Malaysian categories with monthly spending limits.
2. **Debts**: Standalone "Who Owes Me" (Receivables) and "Who I Owe" (Payables), with binary 1-click settlement toggling (Unsettled vs. Settled).
3. **Data & Cloud Sync**: Backed by a cloud Supabase PostgreSQL database, with a zero-credential local fallback mode (localStorage) and a 1-click `supabase/schema.sql` migration file.

## User Stories

1. As a user, I want to open the tracker directly without having to log in or remember passwords, so that I can immediately record spending or check balances.
2. As a user, I want all currency displays to be in Malaysian Ringgit (`RM`), formatted with two decimal places (e.g. `RM 12.50`), so that it naturally matches my daily currency.
3. As a user, I want all financial calculations to be stored as integer Sen internally, so that there are never any floating-point rounding or off-by-a-cent errors.
4. As a user, I want to quickly log an expense with amount, date, category, and an optional note, so that recording transactions takes less than 3 seconds.
5. As a user, I want default Malaysian categories (*Makan & Minum*, *Groceries*, *Transport & Petrol*, *Utilities & Bills*, *Shopping*, *Entertainment*, *Health & Medical*, *General*), so that I can immediately start tracking without manual setup.
6. As a user, I want to set a monthly budget in RM for any category, so that I can monitor my spending against my goals.
7. As a user, I want to see a monthly cashflow summary showing total expenses this month and category budget progress bars, so that I know where my money went.
8. As a user, I want to switch between months, so that I can review past spending history.
9. As a user, I want to filter and search my expense history by keyword or category, so that I can find past purchases easily.
10. As a user, I want to edit or delete any logged expense, so that I can correct accidental entries.
11. As a user, I want to record a standalone debt under "Who Owes Me" (Receivable) with person's name, amount, date, and note, so that I never forget money lent or covered for someone.
12. As a user, I want to record a standalone debt under "Who I Owe" (Payable) with person's name, amount, date, and note, so that I stay accountable for money I need to repay.
13. As a user, I want a 1-click "Mark as Settled" button on any debt, so that I can clear it immediately when paid back without having to calculate partial payments.
14. As a user, I want to view both active (unsettled) and historical (settled) debts in separate tabs or filters, so that my debt view remains clean.
15. As a user, I want summary metrics at the top of the dashboard showing: Total Spent This Month, Total Owed to Me, and Total I Owe, so that my net financial status is instantly visible.
16. As a user, I want the UI to be styled in a calm, editorial, high-contrast palette with monospace tabular numerals and no AI slop, so that it feels like a professional, timeless tool.
17. As a user, I want a `supabase/schema.sql` file provided in the repo, so that I can copy-paste it into Supabase SQL editor to create all required tables and indexes in seconds.
18. As a user, I want the application to boot cleanly and work with local storage if my Supabase credentials are not yet configured in `.env.local`, so that the app never crashes or shows a broken state.

## Implementation Decisions

1. **Stack**: Next.js App Router (TypeScript), Tailwind CSS, Lucide icons, and Radix UI / Shadcn headless primitives.
2. **Precision & Money Model**:
   - Currency: Malaysian Ringgit (`RM`).
   - Domain model: `sen` (integer). 1 RM = 100 Sen.
   - Form inputs accept RM strings (e.g. `12.50`), safely converted to integer Sen before persistence.
3. **Database & Storage Architecture**:
   - Primary: Supabase (`@supabase/supabase-js`) client accessing `expenses`, `categories`, and `debts` tables.
   - Fallback: LocalStorage adapter when `NEXT_PUBLIC_SUPABASE_URL` is undefined or placeholder.
   - SQL Script: `supabase/schema.sql` with table definitions, check constraints, and indexes.
4. **Debts (Owe Tracker)**:
   - Standalone domain entity: `type` is either `'RECEIVABLE'` (Who owes me) or `'PAYABLE'` (Who I owe).
   - Status is binary: `'UNSETTLED'` or `'SETTLED'`.
   - No partial payment records.
5. **UI & Design Philosophy**:
   - Neutral bone, zinc, and warm charcoal surfaces.
   - Monospace tabular numbers for alignment (`font-mono tabular-nums`).
   - Muted indicators: Forest slate for receivables/positive, terracotta/ember for payables/expenses.
   - Quick Add drawer / dialog with keyboard shortcuts (`Ctrl+K` / `N`).

## Testing Decisions

- Test the money formatting and Sen conversion pure functions (`toSen`, `toRMString`, `formatMYR`).
- Test expense and debt validation logic and status state transitions.
- Test category budget calculation functions against expenses within a monthly date range.
- End-to-end and unit tests verifying external behavior rather than internal React state details.

## Out of Scope

- Multi-currency conversions or exchange rate APIs.
- Partial debt payments / installment plans.
- Automatic bill-splitting intertwining expenses with debts.
- Multi-user authentication, login screens, or cloud user registrations.
- Bank sync or automated scraping.

## Further Notes

- Single context repo using `GLOSSARY.md` and `docs/adr/0001-cloud-supabase-standalone-debts-no-auth.md`.
