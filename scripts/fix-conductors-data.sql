-- Script para corrigir dados dos condutores para usar IDs de texto
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se o Condutor 2 existe, se não, criar
INSERT INTO public.conductors (id, name, whatsapp)
SELECT 
  'condutor2',
  'Condutor 2',
  '351968784043'
WHERE NOT EXISTS (
  SELECT 1 FROM public.conductors 
  WHERE id = 'condutor2'
);

-- 2. Verificar se há condutor ativo, se não, criar
INSERT INTO public.active_conductors (conductor_id, is_active)
SELECT 
  'condutor2',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.active_conductors 
  WHERE conductor_id = 'condutor2'
  AND is_active = true
);

-- 3. Verificar resultado
SELECT 'Condutores:' as info;
SELECT * FROM public.conductors;

SELECT 'Condutores ativos:' as info;
SELECT * FROM public.active_conductors WHERE is_active = true; 