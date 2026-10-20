"use client";

import React from "react";
import { formatMYR } from "@/lib/money";
import { ArrowUpRight, ArrowDownLeft, Receipt, Scale } from "lucide-react";

interface SummaryCardsProps {
  totalExpensesSen: number;
  expenseCount: number;
  totalReceivablesSen: number;
  receivableCount: number;
  totalPayablesSen: number;
  payableCount: number;
}

export function SummaryCards({
  totalExpensesSen,
  expenseCount,
  totalReceivablesSen,
  receivableCount,
  totalPayablesSen,
  payableCount,
}: SummaryCardsProps) {
  const netDebtSen = totalReceivablesSen - totalPayablesSen;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Monthly Expenses */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
          <span>This Month's Spending</span>
          <Receipt className="h-4 w-4" />
        </div>
        <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
          {formatMYR(totalExpensesSen)}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {expenseCount} {expenseCount === 1 ? "expense" : "expenses"} logged
        </div>
      </div>

      {/* Who Owes Me */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span>Who Owes Me</span>
          <ArrowDownLeft className="h-4 w-4" />
        </div>
        <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums">
          {formatMYR(totalReceivablesSen)}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {receivableCount} unsettled {receivableCount === 1 ? "claim" : "claims"}
        </div>
      </div>

      {/* Who I Owe */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-400">
          <span>Who I Owe</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-400 tabular-nums">
          {formatMYR(totalPayablesSen)}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {payableCount} unsettled {payableCount === 1 ? "debt" : "debts"}
        </div>
      </div>

      {/* Net Owe Position */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
          <span>Net Owe Position</span>
          <Scale className="h-4 w-4" />
        </div>
        <div
          className={`mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums ${
            netDebtSen > 0
              ? "text-emerald-700 dark:text-emerald-400"
              : netDebtSen < 0
              ? "text-amber-700 dark:text-amber-400"
              : "text-[var(--foreground)]"
          }`}
        >
          {netDebtSen >= 0 ? `+${formatMYR(netDebtSen)}` : `-${formatMYR(Math.abs(netDebtSen))}`}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {netDebtSen > 0
            ? "People owe you more"
            : netDebtSen < 0
            ? "You owe more than owed"
            : "All debts even"}
        </div>
      </div>
    </div>
  );
}
