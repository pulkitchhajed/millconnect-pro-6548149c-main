-- Add is_featured column to fabrics table
ALTER TABLE public.fabrics 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
