-- Personal Money Tracker Schema for Supabase
-- Run this in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'tag',
  budget_sen INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_sen INTEGER NOT NULL CHECK (amount_sen > 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  spent_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Standalone Debts Table (Who Owes Me / Who I Owe)
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('RECEIVABLE', 'PAYABLE')),
  person_name TEXT NOT NULL,
  amount_sen INTEGER NOT NULL CHECK (amount_sen > 0),
  note TEXT NOT NULL DEFAULT '',
  due_date DATE DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'UNSETTLED' CHECK (status IN ('UNSETTLED', 'SETTLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses(spent_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);

-- Insert Default Malaysian Categories
INSERT INTO categories (name, icon, budget_sen)
VALUES
  ('Makan & Minum', 'utensils', 80000),      -- RM 800 default budget
  ('Groceries', 'shopping-cart', 40000),       -- RM 400 default budget
  ('Transport & Petrol', 'fuel', 25000),       -- RM 250 default budget
  ('Housing & Utilities', 'home', 50000),      -- RM 500 default budget
  ('Subscriptions & Bills', 'receipt', 15000), -- RM 150 default budget
  ('Shopping', 'shopping-bag', 20000),         -- RM 200 default budget
  ('Health & Medical', 'heart-pulse', NULL),
  ('General', 'circle-dot', NULL)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (Optional: for personal use without auth, allow full access)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on debts" ON debts FOR ALL USING (true) WITH CHECK (true);
