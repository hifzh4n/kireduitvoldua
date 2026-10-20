"use client";

import React, { useState, useEffect, useRef } from "react";
import { Category, Expense, CreateExpenseInput, UpdateExpenseInput, CreateDebtInput, DebtType } from "@/types";
import { parseMYRInput, formatMYR, fromSen } from "@/lib/money";
import { getLocalDateString } from "@/lib/date";
import { X, Receipt, ArrowDownLeft, ArrowUpRight, RotateCcw } from "lucide-react";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingExpense?: Expense | null;
  onAddExpense: (input: CreateExpenseInput) => Promise<void>;
  onUpdateExpense?: (id: string, input: UpdateExpenseInput) => Promise<void>;
  onAddDebt: (input: CreateDebtInput) => Promise<void>;
}

const QUICK_DENOMINATIONS = [5, 10, 20, 50, 100];

export function QuickAddModal({
  isOpen,
  onClose,
  categories,
  editingExpense,
  onAddExpense,
  onUpdateExpense,
  onAddDebt,
}: QuickAddModalProps) {
  const [entryType, setEntryType] = useState<"EXPENSE" | "DEBT">("EXPENSE");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [debtType, setDebtType] = useState<DebtType>("RECEIVABLE");
  const [personName, setPersonName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingExpense) {
        setEntryType("EXPENSE");
        setAmountStr(fromSen(editingExpense.amount_sen).toFixed(2));
        setNote(editingExpense.note || "");
        setSpentAt(editingExpense.spent_at);
        setCategoryId(editingExpense.category_id || (categories[0]?.id ?? ""));
      } else {
        setAmountStr("");
        setNote("");
        setPersonName("");
        setDueDate("");
        setSpentAt(getLocalDateString(new Date()));
        if (categories.length > 0 && !categoryId) {
          setCategoryId(categories[0].id);
        }
      }
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, editingExpense, categories, categoryId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddDenomination = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = Math.round((current + val) * 100) / 100;
    setAmountStr(next.toString());
  };

  const handleClearAmount = () => {
    setAmountStr("");
    amountInputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseMYRInput(amountStr);
    if (!parsed.success) {
      setError(parsed.error);
      return;
    }

    setIsSubmitting(true);
    try {
      if (entryType === "EXPENSE") {
        const cat = categories.find((c) => c.id === categoryId);
        if (editingExpense && onUpdateExpense) {
          await onUpdateExpense(editingExpense.id, {
            amount_sen: parsed.sen,
            category_id: categoryId || null,
            category_name: cat ? cat.name : "General",
            note: note.trim(),
            spent_at: spentAt,
          });
        } else {
          await onAddExpense({
            amount_sen: parsed.sen,
            category_id: categoryId || null,
            category_name: cat ? cat.name : "General",
            note: note.trim(),
            spent_at: spentAt,
          });
        }
      } else {
        if (!personName.trim()) {
          setError("Person name is required for debts");
          setIsSubmitting(false);
          return;
        }
        await onAddDebt({
          type: debtType,
          person_name: personName.trim(),
          amount_sen: parsed.sen,
          note: note.trim(),
          due_date: dueDate ? dueDate : null,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseMYRInput(amountStr);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 pb-7 sm:pb-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden -mt-2 mb-3 flex justify-center">
          <div className="h-1.5 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
          {editingExpense ? (
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Edit Expense</h2>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEntryType("EXPENSE");
                  setError(null);
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                  entryType === "EXPENSE"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryType("DEBT");
                  setError(null);
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                  entryType === "DEBT"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="font-semibold">Owe Record</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)] active:scale-95"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* If Debt, choose direction */}
          {entryType === "DEBT" && !editingExpense && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)]">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebtType("RECEIVABLE")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all active:scale-98 ${
                    debtType === "RECEIVABLE"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                      : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)]"
                  }`}
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  <span>Who Owes Me</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType("PAYABLE")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all active:scale-98 ${
                    debtType === "PAYABLE"
                      ? "border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold"
                      : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)]"
                  }`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Who I Owe</span>
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--muted)]">Amount (RM)</label>
              {parsedAmount.success && (
                <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatMYR(parsedAmount.sen)}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-semibold text-[var(--muted)]">
                RM
              </span>
              <input
                ref={amountInputRef}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2.5 pl-12 pr-3 font-mono text-lg font-bold text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--foreground)] focus:outline-hidden"
                required
              />
            </div>

            {/* Quick Denomination Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {QUICK_DENOMINATIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddDenomination(val)}
                  className="rounded-full border border-[var(--card-border)] bg-[var(--muted-bg)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--foreground)] hover:bg-stone-200 dark:hover:bg-stone-800 active:scale-95 transition-all"
                >
                  +RM {val}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-[var(--muted)] hover:text-red-600 active:scale-95"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* If Debt, contact name */}
          {entryType === "DEBT" && !editingExpense && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted)]">Contact / Person</label>
              <input
                type="text"
                placeholder="e.g. Ali, Sarah, John"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
                required
              />
            </div>
          )}

          {/* If Expense, Category Picker */}
          {entryType === "EXPENSE" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted)]">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Due Date */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted)]">Date</label>
              <input
                type="date"
                value={spentAt}
                onChange={(e) => setSpentAt(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
                required
              />
            </div>

            {entryType === "DEBT" && !editingExpense && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted)]">Due Date (Optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Note Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted)]">Note</label>
            <input
              type="text"
              placeholder={
                entryType === "EXPENSE"
                  ? "e.g. Lunch at Nasi Kandar Pelita"
                  : "e.g. Covered badminton share"
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-hidden"
            />
          </div>

          {/* Submit Actions */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-[var(--card-border)] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto rounded-lg border border-[var(--card-border)] py-2.5 px-3 text-xs font-medium text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial rounded-lg bg-[var(--foreground)] py-2.5 px-5 text-xs font-medium text-[var(--background)] hover:opacity-90 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : editingExpense
                ? "Save Changes"
                : entryType === "EXPENSE"
                ? "Record Expense"
                : "Record Debt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
