-- Cria ou altera as colunas de localização na tabela active_conductors, se não existirem
ALTER TABLE public.active_conductors
ADD COLUMN IF NOT EXISTS current_latitude float8,
ADD COLUMN IF NOT EXISTS current_longitude float8;
