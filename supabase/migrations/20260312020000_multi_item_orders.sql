-- Add category to fabrics
ALTER TABLE public.fabrics ADD COLUMN IF NOT EXISTS category TEXT;

-- Add items JSONB column to orders and quote_requests for multi-color support
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Example categories: Cotton, Polyester, Uniform, etc.
UPDATE public.fabrics SET category = 'Cotton' WHERE type ILIKE '%cotton%';
UPDATE public.fabrics SET category = 'Polyester' WHERE type ILIKE '%polyester%';
UPDATE public.fabrics SET category = 'Uniform' WHERE type ILIKE '%uniform%';
