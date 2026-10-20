"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus, Database, HardDrive } from "lucide-react";
import { Logo } from "@/components/Logo";

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
    month: "short",
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
    <header className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[var(--card)]/95 backdrop-blur-md px-3.5 py-2.5 sm:px-6 sm:py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        {/* Brand & Sync Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <Logo size={24} className="rounded-md" />
            <div className="flex items-baseline gap-1.5">
              <h1 className="font-mono text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                kireduit
              </h1>
              <span className="hidden sm:inline text-xs font-medium text-[var(--muted)]">
                / ledger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--muted-bg)] px-2 py-0.5 text-[10px] sm:text-xs text-[var(--muted)]">
            {isSupabaseConfigured ? (
              <>
                <Database className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-[var(--foreground)]">Cloud</span>
              </>
            ) : (
              <>
                <HardDrive className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                <span>Local</span>
              </>
            )}
          </div>
        </div>

        {/* Month Selector & Quick Add */}
        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-0.5 text-xs">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="rounded p-1 sm:p-1.5 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="px-2 font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] min-w-[76px] sm:min-w-[85px] text-center">
              {formattedMonth}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="rounded p-1 sm:p-1.5 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] active:scale-95"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* New Entry Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--foreground)] px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-[var(--background)] transition-opacity hover:opacity-90 active:scale-95 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add</span>
            <kbd className="hidden rounded bg-stone-700 px-1 py-0.5 font-mono text-[10px] text-stone-200 dark:bg-stone-300 dark:text-stone-900 md:inline-block">
              N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
