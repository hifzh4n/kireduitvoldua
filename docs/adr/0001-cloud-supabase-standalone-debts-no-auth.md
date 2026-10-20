# ADR 0001: Cloud Supabase Storage, Standalone Binary Debts, and Direct Access

We are building a single-user personal money tracker for Malaysian Ringgit (MYR) with Next.js, using Supabase as the primary cloud database with a zero-credential local fallback mode.

To keep data entry friction minimal for daily use:
1. **No Authentication**: The application directly opens to the tracker without login/signup barriers or session expiration.
2. **Standalone Binary Debts**: Debts are tracked independently as either "Who Owes Me" (Receivable) or "Who I Owe" (Payable). Settlements are strictly binary (Unsettled or Settled) with 1-click toggling, intentionally omitting partial payments or complex bill-splitting to keep cognitive load low.
3. **Sen Precision**: All monetary values are strictly represented and stored as integer Sen (1 RM = 100 Sen) to eliminate floating-point representation bugs.
4. **Natural UI ("No AI Slop")**: High-density typography using Tailwind CSS, Shadcn/Radix UI primitives, tabular monospace numerals, and warm neutral paper/slate tones instead of generic gradients and bloated cards.
