# Personal Money Tracker

A calm, high-density personal expense and debt tracking system for Malaysian Ringgit (MYR), powered by Next.js and Supabase.

## Language

**Expense**:
An outflow of money for personal consumption, categorized and dated.
_Avoid_: Outgoing, debit, spending entry

**Debt**:
An unfulfilled financial obligation between the user and another person, managed independently as a standalone record.
_Avoid_: IOU, loan, credit, split bill

**Receivable ("Who Owes Me")**:
A standalone debt where another person owes money to the user (e.g., money lent or payments covered).
_Avoid_: Credit, loan-out, claim

**Payable ("Who I Owe")**:
A standalone debt where the user owes money to another person (e.g., money borrowed or payments covered).
_Avoid_: Liability, loan-in, borrowed

**Settlement**:
The action of marking a debt as fully resolved and paid.
_Avoid_: Partial payment, installment, liquidation

**Category Budget**:
A monthly maximum spending target in RM allocated to a specific expense category.
_Avoid_: Limit, allowance, quota

**Sen**:
The atomic integer currency unit of Malaysian Ringgit (1 RM = 100 Sen) used for all internal calculations to eliminate floating-point rounding errors.
_Avoid_: Cents, float amount
