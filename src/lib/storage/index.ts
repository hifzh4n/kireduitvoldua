import type {
  Category,
  Expense,
  Debt,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateDebtInput,
  DebtType,
  DebtStatus,
  StorageRepository,
} from "../../types/index.ts";
import { supabase, isSupabaseConfigured } from "./supabase";
import { localRepository } from "./local";
import { getMonthBounds } from "../date";

export { isSupabaseConfigured };

export const storage: StorageRepository = {
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Supabase getCategories error:", error);
        throw new Error(`Failed to load categories: ${error.message}`);
      }

      return (data || []) as Category[];
    }

    return localRepository.getCategories();
  },

  async saveCategoryBudget(categoryId: string, budget_sen: number | null): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("categories")
        .update({ budget_sen })
        .eq("id", categoryId);

      if (error) {
        console.error("Supabase saveCategoryBudget error:", error);
        throw new Error(`Failed to update budget: ${error.message}`);
      }
      return;
    }

    return localRepository.saveCategoryBudget(categoryId, budget_sen);
  },

  async createCategory(name: string, icon = "tag", budget_sen: number | null = null): Promise<Category> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: name.trim(), icon, budget_sen }])
        .select()
        .single();

      if (error || !data) {
        console.error("Supabase createCategory error:", error);
        throw new Error(`Failed to create category: ${error?.message || "Unknown error"}`);
      }

      return data as Category;
    }

    return localRepository.createCategory(name, icon, budget_sen);
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase deleteCategory error:", error);
        throw new Error(`Failed to delete category: ${error.message}`);
      }
      return;
    }

    return localRepository.deleteCategory(id);
  },

  async getExpenses(options?: { month?: string; categoryId?: string }): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("spent_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (options?.month) {
        const { start, nextMonthStart } = getMonthBounds(options.month);
        query = query.gte("spent_at", start).lt("spent_at", nextMonthStart);
      }

      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Supabase getExpenses error:", error);
        throw new Error(`Failed to load expenses: ${error.message}`);
      }

      return (data || []) as Expense[];
    }

    return localRepository.getExpenses(options);
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    if (isSupabaseConfigured && supabase) {
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
        console.error("Supabase createExpense error:", error);
        throw new Error(`Failed to create expense: ${error?.message || "Unknown error"}`);
      }

      return data as Expense;
    }

    return localRepository.createExpense(input);
  },

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
    if (isSupabaseConfigured && supabase) {
      const updatePayload: Record<string, unknown> = {};
      if (input.amount_sen !== undefined) updatePayload.amount_sen = input.amount_sen;
      if (input.category_id !== undefined) updatePayload.category_id = input.category_id;
      if (input.category_name !== undefined) updatePayload.category_name = input.category_name;
      if (input.note !== undefined) updatePayload.note = input.note;
      if (input.spent_at !== undefined) updatePayload.spent_at = input.spent_at;

      const { data, error } = await supabase
        .from("expenses")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        console.error("Supabase updateExpense error:", error);
        throw new Error(`Failed to update expense: ${error?.message || "Unknown error"}`);
      }

      return data as Expense;
    }

    return localRepository.updateExpense(id, input);
  },

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase deleteExpense error:", error);
        throw new Error(`Failed to delete expense: ${error.message}`);
      }
      return;
    }

    return localRepository.deleteExpense(id);
  },

  async getDebts(options?: { type?: DebtType; status?: DebtStatus }): Promise<Debt[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("debts")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.type) {
        query = query.eq("type", options.type);
      }

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Supabase getDebts error:", error);
        throw new Error(`Failed to load debts: ${error.message}`);
      }

      return (data || []) as Debt[];
    }

    return localRepository.getDebts(options);
  },

  async createDebt(input: CreateDebtInput): Promise<Debt> {
    if (isSupabaseConfigured && supabase) {
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
        console.error("Supabase createDebt error:", error);
        throw new Error(`Failed to create debt: ${error?.message || "Unknown error"}`);
      }

      return data as Debt;
    }

    return localRepository.createDebt(input);
  },

  async toggleDebtStatus(id: string, currentStatus: DebtStatus): Promise<Debt> {
    if (isSupabaseConfigured && supabase) {
      const nextStatus = currentStatus === "UNSETTLED" ? "SETTLED" : "UNSETTLED";
      const settled_at = nextStatus === "SETTLED" ? new Date().toISOString() : null;

      const { data, error } = await supabase
        .from("debts")
        .update({ status: nextStatus, settled_at })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        console.error("Supabase toggleDebtStatus error:", error);
        throw new Error(`Failed to toggle debt status: ${error?.message || "Unknown error"}`);
      }

      return data as Debt;
    }

    return localRepository.toggleDebtStatus(id, currentStatus);
  },

  async deleteDebt(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase deleteDebt error:", error);
        throw new Error(`Failed to delete debt: ${error.message}`);
      }
      return;
    }

    return localRepository.deleteDebt(id);
  },
};
