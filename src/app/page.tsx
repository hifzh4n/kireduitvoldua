"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Category, Expense, Debt, CreateExpenseInput, CreateDebtInput, DebtStatus } from "@/types";
import { storage, isSupabaseConfigured } from "@/lib/storage";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { NavigationTabs, TabKey } from "@/components/NavigationTabs";
import { ExpensesList } from "@/components/ExpensesList";
import { DebtsList } from "@/components/DebtsList";
import { CategoryBudgets } from "@/components/CategoryBudgets";
import { QuickAddModal } from "@/components/QuickAddModal";
import { Plus } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabKey>("expenses");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and debts on mount
  const loadData = useCallback(async (month: string) => {
    if (!month) return;
    setIsLoading(true);
    try {
      const [cats, exps, dbs] = await Promise.all([
        storage.getCategories(),
        storage.getExpenses({ month }),
        storage.getDebts(),
      ]);
      setCategories(cats);
      setExpenses(exps);
      setDebts(dbs);
    } catch (err) {
      console.error("Failed to load tracker data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const initialMonth = `${y}-${m}`;
    setCurrentMonth(initialMonth);
    setMounted(true);
    loadData(initialMonth);
  }, [loadData]);

  // Global keyboard shortcuts (Ctrl+K or N to open quick add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N" || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers for Expenses
  const handleAddExpense = async (input: CreateExpenseInput) => {
    const created = await storage.createExpense(input);
    if (input.spent_at.startsWith(currentMonth)) {
      setExpenses((prev) => [created, ...prev]);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await storage.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Debts
  const handleAddDebt = async (input: CreateDebtInput) => {
    const created = await storage.createDebt(input);
    setDebts((prev) => [created, ...prev]);
  };

  const handleToggleDebtStatus = async (id: string, currentStatus: DebtStatus) => {
    const updated = await storage.toggleDebtStatus(id, currentStatus);
    setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)));
  };

  const handleDeleteDebt = async (id: string) => {
    await storage.deleteDebt(id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Handlers for Categories
  const handleSaveBudget = async (categoryId: string, budgetSen: number | null) => {
    await storage.saveCategoryBudget(categoryId, budgetSen);
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, budget_sen: budgetSen } : c))
    );
  };

  const handleCreateCategory = async (name: string) => {
    const created = await storage.createCategory(name);
    setCategories((prev) => [...prev, created]);
  };

  // Calculated Metrics
  const totalExpensesSen = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount_sen, 0);
  }, [expenses]);

  const unsettledReceivables = useMemo(() => {
    return debts.filter((d) => d.type === "RECEIVABLE" && d.status === "UNSETTLED");
  }, [debts]);

  const totalReceivablesSen = useMemo(() => {
    return unsettledReceivables.reduce((sum, d) => sum + d.amount_sen, 0);
  }, [unsettledReceivables]);

  const unsettledPayables = useMemo(() => {
    return debts.filter((d) => d.type === "PAYABLE" && d.status === "UNSETTLED");
  }, [debts]);

  const totalPayablesSen = useMemo(() => {
    return unsettledPayables.reduce((sum, d) => sum + d.amount_sen, 0);
  }, [unsettledPayables]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
    loadData(month);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Top Header */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-5xl px-3.5 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-8 space-y-4 sm:space-y-6">
        {/* Summary Metric Cards */}
        <SummaryCards
          totalExpensesSen={totalExpensesSen}
          expenseCount={expenses.length}
          totalReceivablesSen={totalReceivablesSen}
          receivableCount={unsettledReceivables.length}
          totalPayablesSen={totalPayablesSen}
          payableCount={unsettledPayables.length}
        />

        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          expenseCount={expenses.length}
          unsettledReceivablesCount={unsettledReceivables.length}
          unsettledPayablesCount={unsettledPayables.length}
        />

        {/* Tab View Content */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="font-mono text-xs text-[var(--muted)]">Loading ledger data...</div>
          </div>
        ) : (
          <div className="pt-2">
            {activeTab === "expenses" && (
              <ExpensesList
                expenses={expenses}
                categories={categories}
                onDeleteExpense={handleDeleteExpense}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              />
            )}

            {activeTab === "receivables" && (
              <DebtsList
                type="RECEIVABLE"
                debts={debts}
                onToggleStatus={handleToggleDebtStatus}
                onDeleteDebt={handleDeleteDebt}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              />
            )}

            {activeTab === "payables" && (
              <DebtsList
                type="PAYABLE"
                debts={debts}
                onToggleStatus={handleToggleDebtStatus}
                onDeleteDebt={handleDeleteDebt}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              />
            )}

            {activeTab === "budgets" && (
              <CategoryBudgets
                categories={categories}
                expenses={expenses}
                onSaveBudget={handleSaveBudget}
                onCreateCategory={handleCreateCategory}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setIsQuickAddOpen(true)}
        className="sm:hidden fixed bottom-6 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-2xl active:scale-90 transition-transform"
        aria-label="Add new entry"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onAddExpense={handleAddExpense}
        onAddDebt={handleAddDebt}
      />
    </div>
  );
}
