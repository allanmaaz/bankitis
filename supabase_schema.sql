-- ==============================================================================
-- BANKITIS ONLINE BANKING SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- Copy and paste this complete script into Supabase SQL Editor and click "RUN".
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  pin TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_number TEXT UNIQUE NOT NULL,
  upi_id TEXT UNIQUE NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 50000.00,
  daily_limit NUMERIC(15, 2) NOT NULL DEFAULT 200000.00,
  daily_spent NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  failed_pin_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Beneficiaries Table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  account_number TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Transactions Ledger Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  sender_account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  receiver_account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  category TEXT NOT NULL DEFAULT 'GENERAL',
  description TEXT NULL,
  sender_balance_after NUMERIC(15, 2) NOT NULL,
  receiver_balance_after NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NULL,
  action TEXT NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ANON PERMISSIONS
-- Allows the React application to query and record transactions directly
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for coursework evaluation
DROP POLICY IF EXISTS "Public access users" ON public.users;
CREATE POLICY "Public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access accounts" ON public.accounts;
CREATE POLICY "Public access accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access beneficiaries" ON public.beneficiaries;
CREATE POLICY "Public access beneficiaries" ON public.beneficiaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access transactions" ON public.transactions;
CREATE POLICY "Public access transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access notifications" ON public.notifications;
CREATE POLICY "Public access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access audit_logs" ON public.audit_logs;
CREATE POLICY "Public access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INSERT INITIAL CLEAN SEED DATA
-- ==============================================================================

INSERT INTO public.users (id, name, email, password, role, pin, phone)
VALUES
  ('usr_admin', 'Administrator', 'admin@bank.com', 'Password@123', 'ADMIN', '999999', '+91 99999 00000'),
  ('usr_1', 'Customer Account', 'user@bank.com', 'Password@123', 'CUSTOMER', '123456', '+91 90000 00001'),
  ('usr_2', 'Recipient Account', 'recipient@bank.com', 'Password@123', 'CUSTOMER', '123456', '+91 90000 00002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.accounts (id, user_id, account_number, upi_id, balance, daily_limit, daily_spent, status)
VALUES
  ('acc_1', 'usr_1', 'ACC1000849201', 'user@bank', 75000.00, 200000.00, 0.00, 'ACTIVE'),
  ('acc_2', 'usr_2', 'ACC1000849202', 'recipient@bank', 50000.00, 200000.00, 0.00, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.beneficiaries (id, user_id, name, upi_id, account_number, nickname)
VALUES
  ('ben_1', 'usr_1', 'Recipient Account', 'recipient@bank', 'ACC1000849202', 'Recipient'),
  ('ben_2', 'usr_2', 'Customer Account', 'user@bank', 'ACC1000849201', 'Customer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (id, reference, sender_account_id, receiver_account_id, amount, fee, status, category, description, sender_balance_after, receiver_balance_after)
VALUES
  ('txn_init_1', 'TXN-20261110-8X91PZ', 'acc_2', 'acc_1', 2500.00, 0.00, 'SUCCESS', 'SERVICES', 'Services settlement', 50000.00, 75000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (id, user_id, action, details)
VALUES
  ('aud_1', 'usr_admin', 'SYSTEM_BOOTSTRAP', 'Bankitis Online Banking Engine initialized on Supabase PostgreSQL.')
ON CONFLICT (id) DO NOTHING;

