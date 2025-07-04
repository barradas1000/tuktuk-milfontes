-- Script para verificar e corrigir compatibilidade entre código e tabelas existentes
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as exists
FROM (VALUES 
  ('conductors'),
  ('active_conductors'), 
  ('blocked_periods')
) as t(table_name);

-- 2. Verificar estrutura da tabela conductors
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'conductors'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela active_conductors
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'active_conductors'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela blocked_periods
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'blocked_periods'
ORDER BY ordinal_position;

-- 5. Verificar dados existentes na tabela conductors
SELECT * FROM public.conductors;

-- 6. Verificar dados existentes na tabela active_conductors
SELECT * FROM public.active_conductors;

-- 7. Verificar foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('active_conductors', 'conductors', 'blocked_periods'); 