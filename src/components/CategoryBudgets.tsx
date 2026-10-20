"use client";

import React, { useState, useMemo } from "react";
import { Category, Expense } from "@/types";
import { formatMYR, parseMYRInput, fromSen } from "@/lib/money";
import { Edit2, Check, X, Plus, Trash2 } from "lucide-react";

interface CategoryBudgetsProps {
  categories: Category[];
  expenses: Expense[];
  onSaveBudget: (categoryId: string, budgetSen: number | null) => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoryBudgets({
  categories,
  expenses,
  onSaveBudget,
  onCreateCategory,
  onDeleteCategory,
}: CategoryBudgetsProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute spent amount per category for this month
  const categoryStats = useMemo(() => {
    const spentMap: { [catId: string]: number } = {};
    let uncategorizedSen = 0;

    for (const exp of expenses) {
      if (exp.category_id && categories.some((c) => c.id === exp.category_id)) {
        spentMap[exp.category_id] = (spentMap[exp.category_id] || 0) + exp.amount_sen;
      } else {
        uncategorizedSen += exp.amount_sen;
      }
    }

    const list = categories.map((cat) => {
      const spentSen = spentMap[cat.id] || 0;
      const budgetSen = cat.budget_sen;
      const percentage = budgetSen && budgetSen > 0 ? Math.round((spentSen / budgetSen) * 100) : null;

      return {
        ...cat,
        spentSen,
        percentage,
      };
    }).sort((a, b) => b.spentSen - a.spentSen);

    if (uncategorizedSen > 0) {
      list.push({
        id: "uncategorized",
        name: "Other / Uncategorized",
        icon: "circle-dot",
        budget_sen: null,
        created_at: "",
        spentSen: uncategorizedSen,
        percentage: null,
      });
    }

    return list;
  }, [categories, expenses]);

  const handleStartEdit = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setBudgetInput(cat.budget_sen ? String(fromSen(cat.budget_sen)) : "");
    setError(null);
  };

  const handleSaveBudget = async (categoryId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      if (!budgetInput.trim()) {
        await onSaveBudget(categoryId, null);
      } else {
        const parsed = parseMYRInput(budgetInput);
        if (!parsed.success) {
          setError(parsed.error);
          setIsSaving(false);
          return;
        }
        await onSaveBudget(categoryId, parsed.sen);
      }
      setEditingCategoryId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update budget");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSaving(true);
    try {
      await onCreateCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsNewCategoryOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsDeletingId(id);
    try {
      await onDeleteCategory(id);
      setConfirmDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Monthly Budgets</h2>
          <p className="text-xs text-[var(--muted)]">
            Category spending targets for this month.
          </p>
        </div>

        <button
          onClick={() => setIsNewCategoryOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)] active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* New Category Dialog */}
      {isNewCategoryOpen && (
        <form
          onSubmit={handleCreateCategory}
          className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xs"
        >
          <input
            type="text"
            placeholder="Category name (e.g. Coffee, Books)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
            autoFocus
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-[var(--foreground)] px-3.5 py-2 text-xs font-medium text-[var(--background)] hover:opacity-90 active:scale-95"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsNewCategoryOpen(false)}
            className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
        {categoryStats.map((cat) => {
          const isEditing = editingCategoryId === cat.id;
          const isOverBudget = cat.budget_sen && cat.spentSen > cat.budget_sen;
          const isNearBudget =
            cat.budget_sen &&
            !isOverBudget &&
            cat.percentage !== null &&
            cat.percentage >= 80;
          const isUncategorized = cat.id === "uncategorized";

          return (
            <div
              key={cat.id}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3.5 sm:p-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">
                    {cat.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono text-base font-bold text-[var(--foreground)] tabular-nums">
                      {formatMYR(cat.spentSen)}
                    </span>
                    <span className="text-xs text-[var(--muted)]">spent</span>
                  </div>
                </div>

                {!isEditing && !isUncategorized && (
                  confirmDeleteId === cat.id ? (
                    <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 dark:border-red-900/60 dark:bg-red-950/60 animate-in fade-in">
                      <span className="text-[11px] font-medium text-red-700 dark:text-red-400">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={isDeletingId === cat.id}
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
                        onClick={() => handleStartEdit(cat)}
                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] active:scale-95"
                        title="Edit Monthly Budget"
                        aria-label="Edit Monthly Budget"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400 active:scale-95"
                        title="Delete Category"
                        aria-label="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Progress Bar & Status */}
              <div className="mt-3 space-y-1.5">
                {cat.budget_sen ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                      <span>
                        Budget:{" "}
                        <strong className="text-[var(--foreground)] font-mono">
                          {formatMYR(cat.budget_sen)}
                        </strong>
                      </span>
                      <span
                        className={`font-mono font-medium ${
                          isOverBudget
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : isNearBudget
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {cat.percentage}%
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted-bg)]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOverBudget
                            ? "bg-red-600 dark:bg-red-500"
                            : isNearBudget
                            ? "bg-amber-500"
                            : "bg-emerald-600 dark:bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(cat.percentage || 0, 100)}%` }}
                      />
                    </div>

                    {isOverBudget && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        Over budget by {formatMYR(cat.spentSen - cat.budget_sen)}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-[var(--muted)] italic">
                    No budget target set
                  </div>
                )}
              </div>

              {/* Inline Edit Form */}
              {isEditing && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--card-border)] pt-2.5">
                  <span className="font-mono text-xs text-[var(--muted)]">RM</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 500"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-[var(--foreground)] focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveBudget(cat.id)}
                    disabled={isSaving}
                    className="rounded-lg bg-[var(--foreground)] p-2 text-[var(--background)] hover:opacity-90 active:scale-95"
                    title="Save"
                    aria-label="Save"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="rounded-lg p-2 text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95"
                    title="Cancel"
                    aria-label="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
