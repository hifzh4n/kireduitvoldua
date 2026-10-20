import type { Category, Expense, Debt, CreateExpenseInput, CreateDebtInput } from "../../types/index.ts";

const CATEGORIES_KEY = "kireduit_categories";
const EXPENSES_KEY = "kireduit_expenses";
const DEBTS_KEY = "kireduit_debts";

export const INITIAL_DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Makan & Minum", icon: "utensils", budget_sen: 80000, created_at: new Date().toISOString() },
  { id: "cat-2", name: "Groceries", icon: "shopping-cart", budget_sen: 40000, created_at: new Date().toISOString() },
  { id: "cat-3", name: "Transport & Petrol", icon: "fuel", budget_sen: 25000, created_at: new Date().toISOString() },
  { id: "cat-4", name: "Housing & Utilities", icon: "home", budget_sen: 50000, created_at: new Date().toISOString() },
  { id: "cat-5", name: "Subscriptions & Bills", icon: "receipt", budget_sen: 15000, created_at: new Date().toISOString() },
  { id: "cat-6", name: "Shopping", icon: "shopping-bag", budget_sen: 20000, created_at: new Date().toISOString() },
  { id: "cat-7", name: "Health & Medical", icon: "heart-pulse", budget_sen: null, created_at: new Date().toISOString() },
  { id: "cat-8", name: "General", icon: "circle-dot", budget_sen: null, created_at: new Date().toISOString() },
];

const memoryStore = new Map<string, string>();

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  const item = memoryStore.get(key);
  return item ? JSON.parse(item) : defaultValue;
}

function setStored<T>(key: string, value: T): void {
  const json = JSON.stringify(value);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, json);
    } catch (err) {
      console.error("Error writing to localStorage", err);
    }
  } else {
    memoryStore.set(key, json);
  }
}

export const localRepository = {
  async getCategories(): Promise<Category[]> {
    let cats = getStored<Category[]>(CATEGORIES_KEY, []);
    if (!cats || cats.length === 0) {
      cats = INITIAL_DEFAULT_CATEGORIES;
      setStored(CATEGORIES_KEY, cats);
    }
    return cats;
  },

  async saveCategoryBudget(categoryId: string, budget_sen: number | null): Promise<void> {
    const cats = await this.getCategories();
    const updated = cats.map((c) =>
      c.id === categoryId ? { ...c, budget_sen } : c
    );
    setStored(CATEGORIES_KEY, updated);
  },

  async createCategory(name: string, icon = "tag", budget_sen: number | null = null): Promise<Category> {
    const cats = await this.getCategories();
    const newCat: Category = {
      id: "cat-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      icon,
      budget_sen,
      created_at: new Date().toISOString(),
    };
    cats.push(newCat);
    setStored(CATEGORIES_KEY, cats);
    return newCat;
  },

  async getExpenses(options?: { month?: string; categoryId?: string }): Promise<Expense[]> {
    const list = getStored<Expense[]>(EXPENSES_KEY, []);
    return list.filter((exp) => {
      if (options?.month && !exp.spent_at.startsWith(options.month)) {
        return false;
      }
      if (options?.categoryId && exp.category_id !== options.categoryId) {
        return false;
      }
      return true;
    }).sort((a, b) => (b.spent_at > a.spent_at ? 1 : -1));
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const list = getStored<Expense[]>(EXPENSES_KEY, []);
    const newExp: Expense = {
      id: "exp-" + Math.random().toString(36).substring(2, 9),
      amount_sen: input.amount_sen,
      category_id: input.category_id || null,
      category_name: input.category_name,
      note: input.note || "",
      spent_at: input.spent_at,
      created_at: new Date().toISOString(),
    };
    list.unshift(newExp);
    setStored(EXPENSES_KEY, list);
    return newExp;
  },

  async deleteExpense(id: string): Promise<void> {
    const list = getStored<Expense[]>(EXPENSES_KEY, []);
    const filtered = list.filter((e) => e.id !== id);
    setStored(EXPENSES_KEY, filtered);
  },

  async getDebts(options?: { type?: "RECEIVABLE" | "PAYABLE"; status?: "UNSETTLED" | "SETTLED" }): Promise<Debt[]> {
    const list = getStored<Debt[]>(DEBTS_KEY, []);
    return list.filter((d) => {
      if (options?.type && d.type !== options.type) return false;
      if (options?.status && d.status !== options.status) return false;
      return true;
    }).sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  },

  async createDebt(input: CreateDebtInput): Promise<Debt> {
    const list = getStored<Debt[]>(DEBTS_KEY, []);
    const newDebt: Debt = {
      id: "debt-" + Math.random().toString(36).substring(2, 9),
      type: input.type,
      person_name: input.person_name.trim(),
      amount_sen: input.amount_sen,
      note: input.note || "",
      due_date: input.due_date || null,
      status: "UNSETTLED",
      created_at: new Date().toISOString(),
      settled_at: null,
    };
    list.unshift(newDebt);
    setStored(DEBTS_KEY, list);
    return newDebt;
  },

  async toggleDebtStatus(id: string, currentStatus: "UNSETTLED" | "SETTLED"): Promise<Debt> {
    const list = getStored<Debt[]>(DEBTS_KEY, []);
    let updatedDebt: Debt | null = null;
    const updated = list.map((d) => {
      if (d.id === id) {
        const nextStatus = currentStatus === "UNSETTLED" ? "SETTLED" : "UNSETTLED";
        updatedDebt = {
          ...d,
          status: nextStatus,
          settled_at: nextStatus === "SETTLED" ? new Date().toISOString() : null,
        };
        return updatedDebt;
      }
      return d;
    });
    setStored(DEBTS_KEY, updated);
    if (!updatedDebt) throw new Error("Debt not found");
    return updatedDebt;
  },

  async deleteDebt(id: string): Promise<void> {
    const list = getStored<Debt[]>(DEBTS_KEY, []);
    const filtered = list.filter((d) => d.id !== id);
    setStored(DEBTS_KEY, filtered);
  },
};
