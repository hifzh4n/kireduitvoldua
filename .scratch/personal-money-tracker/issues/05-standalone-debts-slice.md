# 05: Standalone Debts ("Owe Tracker") Vertical Slice

**What to build:**
Complete debt tracking slice for "Who Owes Me" (Receivable) and "Who I Owe" (Payable). Includes contact name, RM amount, date, notes, 1-click binary "Mark as Settled" / "Reopen" action, Active vs. Settled filter tabs, and an Add Debt dialog.

**Blocked by:** 03: Editorial UI Shell and Summary Header

**Status:** resolved

- [x] "Who Owes Me" ledger table showing unsettled receivables and total owed
- [x] "Who I Owe" ledger table showing unsettled payables and total liability
- [x] 1-click toggle to mark a debt as Settled (and ability to Reopen if marked accidentally)
- [x] Active (Unsettled) vs. History (Settled) filter toggle
- [x] Add Debt modal (choose Owed to Me vs I Owe, Contact Name, RM Amount, Note, Date)
- [x] Header metric counters update instantly when debts are added or settled
