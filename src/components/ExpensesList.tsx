"use client";

import React, { useState, useMemo } from "react";
import { Expense, Category } from "@/types";
import { formatMYR } from "@/lib/money";
import { formatDisplayDate } from "@/lib/date";
import { Search, Trash2, Edit2, Calendar, Tag, Plus, AlertCircle } from "lucide-react";

interface ExpensesListProps {
  expenses: Expense[];
  categories: Category[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => Promise<void>;
  onOpenQuickAdd: () => void;
}

export function ExpensesList({
  expenses,
  categories,
  onEditExpense,
  onDeleteExpense,
  onOpenQuickAdd,
}: ExpensesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter expenses by search query and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (selectedCategoryId !== "ALL" && item.category_id !== selectedCategoryId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = item.note.toLowerCase().includes(q);
        const matchesCategory = item.category_name.toLowerCase().includes(q);
        if (!matchesNote && !matchesCategory) return false;
      }
      return true;
    });
  }, [expenses, selectedCategoryId, searchQuery]);

  // Group filtered expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: { [date: string]: Expense[] } = {};
    for (const item of filteredExpenses) {
      if (!groups[item.spent_at]) {
        groups[item.spent_at] = [];
      }
      groups[item.spent_at].push(item);
    }
    return Object.entries(groups).sort((a, b) => (b[0] > a[0] ? 1 : -1));
  }, [filteredExpenses]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteExpense(id);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search & Category Pills */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-9 pr-3 text-xs text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--foreground)] focus:outline-hidden"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategoryId("ALL")}
            className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategoryId === "ALL"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategoryId === cat.id
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table / Grouped List */}
      {groupedExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 sm:p-12 text-center">
          <div className="rounded-full bg-[var(--muted-bg)] p-3 text-[var(--muted)]">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
            No expenses found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
            {searchQuery || selectedCategoryId !== "ALL"
              ? "No expenses match your filters."
              : "No expenses recorded for this month yet."}
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-[var(--foreground)] px-3.5 py-2 text-xs font-medium text-[var(--background)] hover:opacity-90 active:scale-98"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add an Expense</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {groupedExpenses.map(([date, items]) => {
            const dayTotalSen = items.reduce((sum, item) => sum + item.amount_sen, 0);

            return (
              <div
                key={date}
                className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xs"
              >
                {/* Date sub-header */}
                <div className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--muted-bg)]/80 px-3.5 py-2 text-xs font-medium text-[var(--muted)]">
                  <span className="font-semibold text-[var(--foreground)]">
                    {formatDisplayDate(date)}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--muted)] tabular-nums">
                    Total: {formatMYR(dayTotalSen)}
                  </span>
                </div>

                {/* Day's Item Rows */}
                <ul className="divide-y divide-[var(--card-border)]">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="group flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[var(--muted-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--foreground)]">
                          <Tag className="h-3 w-3 text-[var(--muted)] shrink-0" />
                          <span className="truncate max-w-[100px] sm:max-w-none">{item.category_name}</span>
                        </span>
                        <span className="truncate text-[var(--foreground)] font-normal">
                          {item.note || <span className="italic text-[var(--muted)]">No note</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs sm:text-sm font-semibold tracking-tight text-[var(--foreground)] tabular-nums">
                          {formatMYR(item.amount_sen)}
                        </span>

                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1 dark:border-red-900/60 dark:bg-red-950/60 animate-in fade-in">
                            <span className="text-[11px] font-medium text-red-700 dark:text-red-400">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700 active:scale-95"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditExpense(item)}
                              className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded p-1.5 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] active:scale-95"
                              title="Edit expense"
                              aria-label="Edit expense"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400 active:scale-95"
                              title="Delete expense"
                              aria-label="Delete expense"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
