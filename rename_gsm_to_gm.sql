-- Rename the 'gsm' column to 'gm' in the 'fabrics' table
ALTER TABLE public.fabrics RENAME COLUMN gsm TO gm;

-- Update the handle_new_user trigger if it references gsm (it shouldn't, but let's be safe)
-- The current implementation of handle_new_user doesn't reference gsm.

-- Verify the change
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fabrics' 
        AND column_name = 'gm'
    ) THEN
        RAISE NOTICE 'Column gsm successfully renamed to gm';
    ELSE
        RAISE EXCEPTION 'Column gm not found in fabrics table';
    END IF;
END $$;
