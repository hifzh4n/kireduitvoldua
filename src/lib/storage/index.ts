import type {
  Category,
  Expense,
  Debt,
  CreateExpenseInput,
  CreateDebtInput,
  DebtType,
  DebtStatus,
  StorageRepository,
} from "../../types/index.ts";
import { supabase, isSupabaseConfigured } from "./supabase";
import { localRepository } from "./local";

export { isSupabaseConfigured };

export const storage: StorageRepository = {
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.getCategories();
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn("Supabase categories query fallback to local", error);
        return localRepository.getCategories();
      }

      return data as Category[];
    } catch {
      return localRepository.getCategories();
    }
  },

  async saveCategoryBudget(categoryId: string, budget_sen: number | null): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.saveCategoryBudget(categoryId, budget_sen);
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({ budget_sen })
        .eq("id", categoryId);

      if (error) {
        console.warn("Supabase update category budget fallback", error);
        return localRepository.saveCategoryBudget(categoryId, budget_sen);
      }
    } catch {
      return localRepository.saveCategoryBudget(categoryId, budget_sen);
    }
  },

  async createCategory(name: string, icon = "tag", budget_sen: number | null = null): Promise<Category> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.createCategory(name, icon, budget_sen);
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: name.trim(), icon, budget_sen }])
        .select()
        .single();

      if (error || !data) {
        return localRepository.createCategory(name, icon, budget_sen);
      }
      return data as Category;
    } catch {
      return localRepository.createCategory(name, icon, budget_sen);
    }
  },

  async getExpenses(options?: { month?: string; categoryId?: string }): Promise<Expense[]> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.getExpenses(options);
    }

    try {
      let query = supabase.from("expenses").select("*").order("spent_at", { ascending: false });

      if (options?.month) {
        // e.g. '2026-10' -> start of month to end of month
        const start = `${options.month}-01`;
        const end = `${options.month}-31`;
        query = query.gte("spent_at", start).lte("spent_at", end);
      }

      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.warn("Supabase expenses query fallback", error);
        return localRepository.getExpenses(options);
      }
      return data as Expense[];
    } catch {
      return localRepository.getExpenses(options);
    }
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.createExpense(input);
    }

    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            amount_sen: input.amount_sen,
            category_id: input.category_id || null,
            category_name: input.category_name,
            note: input.note || "",
            spent_at: input.spent_at,
          },
        ])
        .select()
        .single();

      if (error || !data) {
        console.warn("Supabase createExpense fallback", error);
        return localRepository.createExpense(input);
      }
      return data as Expense;
    } catch {
      return localRepository.createExpense(input);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.deleteExpense(id);
    }

    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) {
        return localRepository.deleteExpense(id);
      }
    } catch {
      return localRepository.deleteExpense(id);
    }
  },

  async getDebts(options?: { type?: DebtType; status?: DebtStatus }): Promise<Debt[]> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.getDebts(options);
    }

    try {
      let query = supabase.from("debts").select("*").order("created_at", { ascending: false });

      if (options?.type) {
        query = query.eq("type", options.type);
      }

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.warn("Supabase getDebts fallback", error);
        return localRepository.getDebts(options);
      }
      return data as Debt[];
    } catch {
      return localRepository.getDebts(options);
    }
  },

  async createDebt(input: CreateDebtInput): Promise<Debt> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.createDebt(input);
    }

    try {
      const { data, error } = await supabase
        .from("debts")
        .insert([
          {
            type: input.type,
            person_name: input.person_name.trim(),
            amount_sen: input.amount_sen,
            note: input.note || "",
            due_date: input.due_date || null,
            status: "UNSETTLED",
          },
        ])
        .select()
        .single();

      if (error || !data) {
        console.warn("Supabase createDebt fallback", error);
        return localRepository.createDebt(input);
      }
      return data as Debt;
    } catch {
      return localRepository.createDebt(input);
    }
  },

  async toggleDebtStatus(id: string, currentStatus: DebtStatus): Promise<Debt> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.toggleDebtStatus(id, currentStatus);
    }

    try {
      const nextStatus = currentStatus === "UNSETTLED" ? "SETTLED" : "UNSETTLED";
      const settled_at = nextStatus === "SETTLED" ? new Date().toISOString() : null;

      const { data, error } = await supabase
        .from("debts")
        .update({ status: nextStatus, settled_at })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        console.warn("Supabase toggleDebtStatus fallback", error);
        return localRepository.toggleDebtStatus(id, currentStatus);
      }
      return data as Debt;
    } catch {
      return localRepository.toggleDebtStatus(id, currentStatus);
    }
  },

  async deleteDebt(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      return localRepository.deleteDebt(id);
    }

    try {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) {
        return localRepository.deleteDebt(id);
      }
    } catch {
      return localRepository.deleteDebt(id);
    }
  },
};
