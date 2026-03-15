-- FIX: Grant Admin Role to Specific Email
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure the app_role type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'sales_manager', 'inventory_manager', 'logistics');
    END IF;
END $$;

-- 2. Ensure the user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable RLS and add basic policies if they don't exist
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage roles') THEN
        CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (
            EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own roles') THEN
        CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. MANUALLY GRANT ADMIN ROLE
-- Replace 'your-email@example.com' with the email of the user you want to make an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role 
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verification query
SELECT au.email, ur.role 
FROM auth.users au
JOIN public.user_roles ur ON au.id = ur.user_id
WHERE au.email = 'pulkitchhajed29@gmail.com';
