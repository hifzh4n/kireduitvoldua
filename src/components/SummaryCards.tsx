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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      {/* Monthly Expenses */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-[var(--muted)]">
          <span className="truncate">This Month</span>
          <Receipt className="h-3.5 w-3.5 shrink-0" />
        </div>
        <div className="mt-1.5 font-mono text-base sm:text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums truncate">
          {formatMYR(totalExpensesSen)}
        </div>
        <div className="mt-0.5 text-[10px] sm:text-xs text-[var(--muted)] truncate">
          {expenseCount} {expenseCount === 1 ? "entry" : "entries"}
        </div>
      </div>

      {/* Who Owes Me */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="truncate">Owed to Me</span>
          <ArrowDownLeft className="h-3.5 w-3.5 shrink-0" />
        </div>
        <div className="mt-1.5 font-mono text-base sm:text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums truncate">
          {formatMYR(totalReceivablesSen)}
        </div>
        <div className="mt-0.5 text-[10px] sm:text-xs text-[var(--muted)] truncate">
          {receivableCount} unsettled
        </div>
      </div>

      {/* Who I Owe */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-amber-700 dark:text-amber-400">
          <span className="truncate">I Owe</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </div>
        <div className="mt-1.5 font-mono text-base sm:text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-400 tabular-nums truncate">
          {formatMYR(totalPayablesSen)}
        </div>
        <div className="mt-0.5 text-[10px] sm:text-xs text-[var(--muted)] truncate">
          {payableCount} unsettled
        </div>
      </div>

      {/* Net Owe Position */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-[var(--muted)]">
          <span className="truncate">Net Position</span>
          <Scale className="h-3.5 w-3.5 shrink-0" />
        </div>
        <div
          className={`mt-1.5 font-mono text-base sm:text-2xl font-bold tracking-tight tabular-nums truncate ${
            netDebtSen > 0
              ? "text-emerald-700 dark:text-emerald-400"
              : netDebtSen < 0
              ? "text-amber-700 dark:text-amber-400"
              : "text-[var(--foreground)]"
          }`}
        >
          {netDebtSen >= 0 ? `+${formatMYR(netDebtSen)}` : `-${formatMYR(Math.abs(netDebtSen))}`}
        </div>
        <div className="mt-0.5 text-[10px] sm:text-xs text-[var(--muted)] truncate">
          {netDebtSen > 0 ? "Positive balance" : netDebtSen < 0 ? "Negative balance" : "All even"}
        </div>
      </div>
    </div>
  );
}
