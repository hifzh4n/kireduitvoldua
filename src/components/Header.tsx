"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus, Database, HardDrive } from "lucide-react";

interface HeaderProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onOpenQuickAdd: () => void;
  isSupabaseConfigured: boolean;
}

export function Header({
  currentMonth,
  onMonthChange,
  onOpenQuickAdd,
  isSupabaseConfigured,
}: HeaderProps) {
  const [yearStr, monthStr] = currentMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthDate = new Date(year, month - 1, 1);
  const formattedMonth = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 2, 1);
    const m = String(prev.getMonth() + 1).padStart(2, "0");
    onMonthChange(`${prev.getFullYear()}-${m}`);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month, 1);
    const m = String(next.getMonth() + 1).padStart(2, "0");
    onMonthChange(`${next.getFullYear()}-${m}`);
  };

  return (
    <header className="border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand & Sync Status */}
        <div className="flex items-center justify-between sm:justify-start sm:gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="font-mono text-xl font-bold tracking-tight text-[var(--foreground)]">
              kireduit
            </h1>
            <span className="text-xs font-medium text-[var(--muted)]">
              / personal ledger
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--muted-bg)] px-2.5 py-1 text-xs text-[var(--muted)]">
            {isSupabaseConfigured ? (
              <>
                <Database className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-[var(--foreground)]">Supabase</span>
              </>
            ) : (
              <>
                <HardDrive className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Local Cache</span>
              </>
            )}
          </div>
        </div>

        {/* Month Selector & Quick Add Action */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center rounded-md border border-[var(--card-border)] bg-[var(--card)] p-0.5 text-sm">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="rounded p-1 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {formattedMonth}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="rounded p-1 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 rounded-md bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Entry</span>
            <kbd className="hidden rounded bg-stone-700 px-1 py-0.5 font-mono text-[10px] text-stone-200 dark:bg-stone-300 dark:text-stone-900 md:inline-block">
              N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
