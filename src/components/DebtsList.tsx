"use client";

import React, { useState, useMemo } from "react";
import { Debt, DebtStatus, DebtType } from "@/types";
import { formatMYR } from "@/lib/money";
import { formatDisplayDate } from "@/lib/date";
import { CheckCircle2, RotateCcw, Trash2, Search, Plus, Calendar, AlertCircle, User } from "lucide-react";

interface DebtsListProps {
  type: DebtType; // RECEIVABLE (Who owes me) or PAYABLE (Who I owe)
  debts: Debt[];
  onToggleStatus: (id: string, currentStatus: DebtStatus) => Promise<void>;
  onDeleteDebt: (id: string) => Promise<void>;
  onOpenQuickAdd: () => void;
}

export function DebtsList({
  type,
  debts,
  onToggleStatus,
  onDeleteDebt,
  onOpenQuickAdd,
}: DebtsListProps) {
  const [statusFilter, setStatusFilter] = useState<DebtStatus>("UNSETTLED");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string>("ALL");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const debtsForType = useMemo(() => {
    return debts.filter((d) => d.type === type);
  }, [debts, type]);

  // Extract unique contacts with their unsettled total
  const contactSummaries = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of debtsForType) {
      if (d.status === "UNSETTLED") {
        map.set(d.person_name, (map.get(d.person_name) || 0) + d.amount_sen);
      } else if (!map.has(d.person_name)) {
        map.set(d.person_name, 0);
      }
    }
    return Array.from(map.entries()).map(([name, totalSen]) => ({
      name,
      totalSen,
    }));
  }, [debtsForType]);

  const filteredDebts = useMemo(() => {
    return debtsForType.filter((d) => {
      if (d.status !== statusFilter) return false;
      if (selectedPerson !== "ALL" && d.person_name !== selectedPerson) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.person_name.toLowerCase().includes(q);
        const matchNote = d.note.toLowerCase().includes(q);
        if (!matchName && !matchNote) return false;
      }
      return true;
    });
  }, [debtsForType, statusFilter, selectedPerson, searchQuery]);

  const totalFilteredSen = useMemo(() => {
    return filteredDebts.reduce((sum, d) => sum + d.amount_sen, 0);
  }, [filteredDebts]);

  const handleToggle = async (id: string, currentStatus: DebtStatus) => {
    setActionLoadingId(id);
    try {
      await onToggleStatus(id, currentStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onDeleteDebt(id);
      setConfirmDeleteId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const isReceivable = type === "RECEIVABLE";
  const title = isReceivable ? "Who Owes Me" : "Who I Owe";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search person or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-9 pr-3 text-xs text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--foreground)] focus:outline-hidden"
          />
        </div>

        {/* Status Toggle & Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("UNSETTLED")}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                statusFilter === "UNSETTLED"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("SETTLED")}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                statusFilter === "SETTLED"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Settled
            </button>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] hover:opacity-90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Contact Filter Chips (U4: Filter by Person) */}
      {contactSummaries.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedPerson("ALL")}
            className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedPerson === "ALL"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            All Contacts
          </button>
          {contactSummaries.map(({ name, totalSen }) => (
            <button
              key={name}
              onClick={() => setSelectedPerson(name)}
              className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedPerson === name
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <User className="h-3 w-3" />
              <span>{name}</span>
              {totalSen > 0 && (
                <span className="font-mono text-[10px] opacity-80">({formatMYR(totalSen)})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filteredDebts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 sm:p-12 text-center">
          <div className="rounded-full bg-[var(--muted-bg)] p-3 text-[var(--muted)]">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
            {statusFilter === "UNSETTLED"
              ? isReceivable
                ? "No one owes you money right now"
                : "You don't owe anyone money right now"
              : "No settled debt history found"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
            {statusFilter === "UNSETTLED"
              ? isReceivable
                ? "Lent money to a friend or covered a group expense? Record it to keep track."
                : "Borrowed money or someone paid for you? Record it so you remember to pay back."
              : "Settled debts will appear here once marked as paid."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--muted-bg)]/80 px-4 py-2 text-xs font-medium text-[var(--muted)]">
            <span>
              {title} &bull; {statusFilter === "UNSETTLED" ? "Active" : "Settled"}
              {selectedPerson !== "ALL" && ` (${selectedPerson})`}
            </span>
            <span className="font-mono text-xs font-semibold text-[var(--foreground)] tabular-nums">
              Total: {formatMYR(totalFilteredSen)}
            </span>
          </div>

          <ul className="divide-y divide-[var(--card-border)]">
            {filteredDebts.map((item) => {
              const isOverdue =
                item.due_date &&
                item.status === "UNSETTLED" &&
                new Date(item.due_date) < new Date(new Date().toISOString().split("T")[0]);

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2.5 p-3.5 transition-colors hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-stone-900/40"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--foreground)] truncate">
                        {item.person_name}
                      </span>
                      {item.status === "SETTLED" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Settled
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950/60 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[var(--muted)]">
                      {item.note && <span className="text-[var(--foreground)] truncate">{item.note}</span>}
                      {item.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          Due: {item.due_date}
                        </span>
                      )}
                      <span>Added: {formatDisplayDate(item.created_at.split("T")[0])}</span>
                    </div>
                  </div>

                  {/* Actions & Amount */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t border-[var(--card-border)] sm:border-0">
                    <span
                      className={`font-mono text-base font-bold tracking-tight tabular-nums ${
                        isReceivable
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {formatMYR(item.amount_sen)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggle(item.id, item.status)}
                        disabled={actionLoadingId === item.id}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                          item.status === "UNSETTLED"
                            ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                            : "bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                        title={item.status === "UNSETTLED" ? "Mark as settled" : "Reopen debt"}
                      >
                        {item.status === "UNSETTLED" ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Settled</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reopen</span>
                          </>
                        )}
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 dark:border-red-900/60 dark:bg-red-950/60 animate-in fade-in">
                          <span className="text-[11px] font-medium text-red-700 dark:text-red-400">
                            Delete?
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoadingId === item.id}
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
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400 active:scale-95"
                          title="Delete debt"
                          aria-label="Delete debt"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
