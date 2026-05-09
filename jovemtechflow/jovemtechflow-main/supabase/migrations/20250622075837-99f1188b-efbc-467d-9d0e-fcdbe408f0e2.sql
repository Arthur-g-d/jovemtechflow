
-- Add missing columns to event_contents table
ALTER TABLE public.event_contents 
ADD COLUMN is_required boolean NOT NULL DEFAULT true,
ADD COLUMN order_index integer NOT NULL DEFAULT 0;
