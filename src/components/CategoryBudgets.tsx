"use client";

import React, { useState, useMemo } from "react";
import { Category, Expense } from "@/types";
import { formatMYR, parseMYRInput, fromSen } from "@/lib/money";
import { Edit2, Check, X, Plus, PieChart, Sparkles } from "lucide-react";

interface CategoryBudgetsProps {
  categories: Category[];
  expenses: Expense[];
  onSaveBudget: (categoryId: string, budgetSen: number | null) => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
}

export function CategoryBudgets({
  categories,
  expenses,
  onSaveBudget,
  onCreateCategory,
}: CategoryBudgetsProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute spent amount per category for this month
  const categoryStats = useMemo(() => {
    const spentMap: { [catId: string]: number } = {};
    for (const exp of expenses) {
      const id = exp.category_id || "uncategorized";
      spentMap[id] = (spentMap[id] || 0) + exp.amount_sen;
    }

    return categories.map((cat) => {
      const spentSen = spentMap[cat.id] || 0;
      const budgetSen = cat.budget_sen;
      const percentage = budgetSen && budgetSen > 0 ? Math.round((spentSen / budgetSen) * 100) : null;

      return {
        ...cat,
        spentSen,
        percentage,
      };
    }).sort((a, b) => b.spentSen - a.spentSen);
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

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Monthly Category Budgets</h2>
          <p className="text-xs text-[var(--muted)]">
            Set spending targets in RM to track against your expenses this month.
          </p>
        </div>

        <button
          onClick={() => setIsNewCategoryOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* New Category Dialog */}
      {isNewCategoryOpen && (
        <form
          onSubmit={handleCreateCategory}
          className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xs"
        >
          <input
            type="text"
            placeholder="Category name (e.g. Coffee, Tech, Fitness)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
            autoFocus
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] hover:opacity-90"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsNewCategoryOpen(false)}
            className="rounded-md border border-[var(--card-border)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categoryStats.map((cat) => {
          const isEditing = editingCategoryId === cat.id;
          const isOverBudget = cat.budget_sen && cat.spentSen > cat.budget_sen;
          const isNearBudget =
            cat.budget_sen &&
            !isOverBudget &&
            cat.percentage !== null &&
            cat.percentage >= 80;

          return (
            <div
              key={cat.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-xs"
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

                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="rounded p-1 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
                    title="Edit Monthly Budget"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
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
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted-bg)]">
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
                    placeholder="e.g. 500 (or blank to clear)"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="flex-1 rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveBudget(cat.id)}
                    disabled={isSaving}
                    className="rounded bg-[var(--foreground)] p-1 text-[var(--background)] hover:opacity-90"
                    title="Save"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="rounded p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                    title="Cancel"
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
