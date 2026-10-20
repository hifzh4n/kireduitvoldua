export type DebtType = "RECEIVABLE" | "PAYABLE";
export type DebtStatus = "UNSETTLED" | "SETTLED";

export interface Category {
  id: string;
  name: string;
  icon: string;
  budget_sen: number | null;
  created_at: string;
}

export interface Expense {
  id: string;
  amount_sen: number;
  category_id: string | null;
  category_name: string;
  note: string;
  spent_at: string; // YYYY-MM-DD
  created_at: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  person_name: string;
  amount_sen: number;
  note: string;
  due_date: string | null; // YYYY-MM-DD
  status: DebtStatus;
  created_at: string;
  settled_at: string | null;
}

export interface CreateExpenseInput {
  amount_sen: number;
  category_id?: string | null;
  category_name: string;
  note?: string;
  spent_at: string; // YYYY-MM-DD
}

export interface UpdateExpenseInput {
  amount_sen?: number;
  category_id?: string | null;
  category_name?: string;
  note?: string;
  spent_at?: string; // YYYY-MM-DD
}

export interface CreateDebtInput {
  type: DebtType;
  person_name: string;
  amount_sen: number;
  note?: string;
  due_date?: string | null;
}

export interface StorageRepository {
  getCategories(): Promise<Category[]>;
  saveCategoryBudget(categoryId: string, budget_sen: number | null): Promise<void>;
  createCategory(name: string, icon?: string, budget_sen?: number | null): Promise<Category>;
  
  getExpenses(options?: { month?: string; categoryId?: string }): Promise<Expense[]>;
  createExpense(input: CreateExpenseInput): Promise<Expense>;
  updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  getDebts(options?: { type?: DebtType; status?: DebtStatus }): Promise<Debt[]>;
  createDebt(input: CreateDebtInput): Promise<Debt>;
  toggleDebtStatus(id: string, currentStatus: DebtStatus): Promise<Debt>;
  deleteDebt(id: string): Promise<void>;
}
