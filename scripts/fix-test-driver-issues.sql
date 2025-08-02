-- Script para corrigir problemas com o motorista de teste
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Corrigir problema de constraint na tabela active_conductors
-- Primeiro, vamos verificar a estrutura atual
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'active_conductors'
ORDER BY ordinal_position;

-- 2. Verificar se existe constraint única em conductor_id
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name = 'active_conductors'
AND kcu.column_name = 'conductor_id';

-- 3. Se não existir constraint única, criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'UNIQUE'
    AND table_name = 'active_conductors'
    AND constraint_name LIKE '%conductor_id%'
  ) THEN
    ALTER TABLE public.active_conductors 
    ADD CONSTRAINT active_conductors_conductor_id_unique 
    UNIQUE (conductor_id);
  END IF;
END $$;

-- 4. Corrigir políticas RLS da tabela drivers
-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Public can view driver location" ON public.drivers;
DROP POLICY IF EXISTS "Admins can update drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can insert drivers" ON public.drivers;

-- 5. Criar políticas corretas para a tabela drivers
CREATE POLICY "Public can view driver location"
  ON public.drivers
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update drivers"
  ON public.drivers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert drivers"
  ON public.drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Adicionar o motorista de teste na tabela active_conductors corretamente
INSERT INTO public.active_conductors (conductor_id, is_active, activated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  true,
  NOW()
)
ON CONFLICT (conductor_id) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  activated_at = EXCLUDED.activated_at,
  deactivated_at = NULL;

-- 7. Adicionar o motorista de teste na tabela drivers
INSERT INTO public.drivers (id, name, is_active, latitude, longitude)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'Motorista Teste',
  false, -- Começa inativo, precisa ativar via dashboard
  37.725,
  -8.783
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- 8. Verificar resultado final
SELECT 'Condutores:' as info;
SELECT * FROM public.conductors ORDER BY created_at;

SELECT 'Condutores ativos:' as info;
SELECT 
  ac.id,
  c.name,
  c.whatsapp,
  ac.is_active,
  ac.activated_at
FROM public.active_conductors ac
JOIN public.conductors c ON ac.conductor_id = c.id
WHERE ac.is_active = true;

SELECT 'Motoristas para rastreamento:' as info;
SELECT * FROM public.drivers ORDER BY created_at;

-- 9. Mostrar estatísticas finais
SELECT 
  'Estatísticas finais:' as info,
  (SELECT COUNT(*) FROM public.conductors) as total_conductors,
  (SELECT COUNT(*) FROM public.active_conductors WHERE is_active = true) as active_conductors,
  (SELECT COUNT(*) FROM public.drivers) as total_drivers,
  (SELECT COUNT(*) FROM public.drivers WHERE is_active = true) as active_drivers; 