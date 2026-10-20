# Kireduit (Personal Money & Owe Tracker)

A calm, high-density personal money and debt tracker built with **Next.js**, **Tailwind CSS**, and **Supabase**, specifically designed for Malaysian Ringgit (`RM`) with zero AI slop.

---

## Features

- **No AI Slop / Tactile Ledger Aesthetic**: Warm bone, slate, and charcoal palette inspired by classic financial journals and high-density productivity tools. Monospaced tabular numerals (`tabular-nums`) keep columns vertically aligned.
- **Malaysian Ringgit (`RM`) & Sen Integer Precision**: All internal financial math is stored in integer **Sen** (1 RM = 100 Sen) to completely eliminate floating-point rounding bugs.
- **Personal Expenses with Month Switching**:
  - Filter by category (*Makan & Minum*, *Groceries*, *Transport & Petrol*, *Utilities*, etc.) or search notes.
  - Quick Add modal (`N` or `Ctrl+K`) with auto-focus and instant validation.
- **Standalone Owe Tracker (Debts)**:
  - **Who Owes Me (Receivables)**: Track money lent to friends or covered group bills.
  - **Who I Owe (Payables)**: Track money borrowed or bills to repay.
  - **1-Click Binary Settlement**: Fast toggle between Active and Settled with 1 click (and 1-click Reopen if marked by mistake).
- **Monthly Category Budgets**: Visual progress bars and inline RM spending limits per category.
- **Cloud Supabase + Local Cache Fallback**:
  - Out of the box, runs locally using persistent browser storage.
  - When you add your Supabase credentials, it automatically connects to your cloud database.
- **Zero Login Friction**: Designed for direct personal access without sign-up screens or expiring auth tokens.

---

## Quick Start

### 1. Install & Run Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Connect to Cloud Supabase (Optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Open your Supabase Dashboard &rarr; **SQL Editor** &rarr; **New Query**.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. Create a `.env.local` file at the root of the project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `npm run dev`. The sync indicator in the header will show **Supabase Connected**.

---

## Keyboard Shortcuts

- <kbd>N</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd>: Open Quick Add Dialog (Expense or Debt)
- <kbd>Enter</kbd>: Submit and record entry
- <kbd>Esc</kbd>: Close modal

---

## Development & Testing

```bash
# Run unit tests (Node.js native test runner)
npm test

# Run production build
npm run build
```

---

## Engineering Discipline

Built using the [Matt Pocock Agent Skills](https://github.com/mattpocock/skills) flow:
- Domain model defined in [`GLOSSARY.md`](./GLOSSARY.md)
- Architectural decisions in [`docs/adr/0001-cloud-supabase-standalone-debts-no-auth.md`](./docs/adr/0001-cloud-supabase-standalone-debts-no-auth.md)
- Specification in [`.scratch/personal-money-tracker/spec.md`](./.scratch/personal-money-tracker/spec.md)
- Verified tracer-bullet tickets in [`.scratch/personal-money-tracker/issues/`](./.scratch/personal-money-tracker/issues/)
