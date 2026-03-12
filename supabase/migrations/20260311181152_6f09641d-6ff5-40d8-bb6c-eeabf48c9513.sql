
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'sales_manager', 'inventory_manager', 'logistics');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user is any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- RLS for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 4. Fabrics table (dynamic catalog)
CREATE TABLE public.fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  colors TEXT NOT NULL DEFAULT '',
  min_order INTEGER NOT NULL DEFAULT 100,
  price_per_meter NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'meters',
  available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  gsm INTEGER,
  weave TEXT,
  width TEXT,
  composition TEXT,
  finish TEXT,
  shrinkage TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fabrics" ON public.fabrics FOR SELECT USING (true);
CREATE POLICY "Admins can manage fabrics" ON public.fabrics FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Fabric images table
CREATE TABLE public.fabric_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabric_id UUID REFERENCES public.fabrics(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fabric_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fabric images" ON public.fabric_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage fabric images" ON public.fabric_images FOR ALL USING (public.is_admin(auth.uid()));

-- 6. Favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fabric_id UUID REFERENCES public.fabrics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fabric_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- 7. Quote requests table
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fabric_id UUID REFERENCES public.fabrics(id) ON DELETE CASCADE NOT NULL,
  fabric_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quotes" ON public.quote_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quotes" ON public.quote_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all quotes" ON public.quote_requests FOR ALL USING (public.is_admin(auth.uid()));

-- 8. Order notes (admin)
CREATE TABLE public.order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage order notes" ON public.order_notes FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Order owner can view notes" ON public.order_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_notes.order_id AND orders.user_id = auth.uid())
);

-- 9. Shipment tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispatch_date TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fabric_id_ref UUID REFERENCES public.fabrics(id);

-- 10. Admin can view/update all orders
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.is_admin(auth.uid()));

-- 11. Seed initial fabrics from the hardcoded catalog
INSERT INTO public.fabrics (name, type, description, colors, min_order, price_per_meter, unit, available) VALUES
  ('Premium Cotton Poplin', 'Cotton', 'Smooth, tightly woven cotton ideal for shirts and dresses', 'White / Off-White', 500, 120, 'meters', true),
  ('Linen Blend Suiting', 'Linen Blend', 'Premium linen-cotton blend for formal suits and blazers', 'Navy / Charcoal', 300, 280, 'meters', true),
  ('Denim Twill 10oz', 'Denim', 'Heavy-duty denim for jeans and workwear', 'Indigo / Black', 1000, 180, 'meters', true),
  ('Silk Crepe de Chine', 'Silk', 'Luxurious silk with a subtle sheen for evening wear', 'Ivory / Blush', 100, 650, 'meters', true),
  ('Polyester Georgette', 'Polyester', 'Lightweight, flowing fabric for dresses and scarves', 'Multiple', 1000, 85, 'meters', true),
  ('Organic Cotton Jersey', 'Cotton', 'Soft, stretchy knit fabric for t-shirts and casual wear', 'Natural / Custom', 500, 150, 'meters', false);

-- 12. Create storage bucket for fabric images
INSERT INTO storage.buckets (id, name, public) VALUES ('fabric-images', 'fabric-images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Anyone can view fabric images storage" ON storage.objects FOR SELECT USING (bucket_id = 'fabric-images');
CREATE POLICY "Admins can upload fabric images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fabric-images' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete fabric images" ON storage.objects FOR DELETE USING (bucket_id = 'fabric-images' AND public.is_admin(auth.uid()));

-- 13. Update trigger for fabrics
CREATE TRIGGER update_fabrics_updated_at BEFORE UPDATE ON public.fabrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Enable realtime for orders (for admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fabrics;
