-- Auto-grant admin role to specific email for existing user
DO $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::public.app_role 
  FROM auth.users 
  WHERE email = 'pulkitchhajed29@gmail.com'
  ON CONFLICT DO NOTHING;
END $$;

-- Update trigger function to handle future signups for this email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  -- Auto-grant admin role to specific email
  IF NEW.email = 'pulkitchhajed29@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;
