
-- Update orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS selected_color TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity_type TEXT NOT NULL DEFAULT 'Lump';

-- Update quote_requests table
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS selected_color TEXT;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS quantity_type TEXT NOT NULL DEFAULT 'Lump';

-- If fabrics table needs any changes, but for now we'll stick to CSV/Structured text in existing colors column
-- However, let's make sure it's TEXT and not an enum or something restrictive (it is TEXT already)
