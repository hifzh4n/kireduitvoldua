"use client";

import React from "react";
import { Receipt, ArrowDownLeft, ArrowUpRight, PieChart } from "lucide-react";

export type TabKey = "expenses" | "receivables" | "payables" | "budgets";

interface NavigationTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  expenseCount: number;
  unsettledReceivablesCount: number;
  unsettledPayablesCount: number;
}

export function NavigationTabs({
  activeTab,
  onTabChange,
  expenseCount,
  unsettledReceivablesCount,
  unsettledPayablesCount,
}: NavigationTabsProps) {
  const tabs = [
    {
      key: "expenses" as TabKey,
      label: "Expenses",
      icon: Receipt,
      badge: expenseCount > 0 ? String(expenseCount) : null,
      badgeVariant: "neutral",
    },
    {
      key: "receivables" as TabKey,
      label: "Who Owes Me",
      icon: ArrowDownLeft,
      badge: unsettledReceivablesCount > 0 ? String(unsettledReceivablesCount) : null,
      badgeVariant: "emerald",
    },
    {
      key: "payables" as TabKey,
      label: "Who I Owe",
      icon: ArrowUpRight,
      badge: unsettledPayablesCount > 0 ? String(unsettledPayablesCount) : null,
      badgeVariant: "amber",
    },
    {
      key: "budgets" as TabKey,
      label: "Budgets",
      icon: PieChart,
      badge: null,
      badgeVariant: "neutral",
    },
  ];

  return (
    <div className="border-b border-[var(--card-border)] -mx-4 px-4 sm:mx-0 sm:px-0">
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-[var(--foreground)] text-[var(--foreground)] font-semibold"
                  : "border-transparent text-[var(--muted)] hover:border-stone-300 hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                    tab.badgeVariant === "emerald"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : tab.badgeVariant === "amber"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-[var(--muted-bg)] text-[var(--foreground)]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
