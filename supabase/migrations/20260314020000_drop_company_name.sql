-- Drop company_name from orders and profiles tables
ALTER TABLE public.orders DROP COLUMN IF EXISTS company_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS company_name;
