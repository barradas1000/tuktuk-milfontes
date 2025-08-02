-- Script para adicionar o terceiro motorista de teste
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela drivers existe, se não, criar
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8) DEFAULT 37.725,
  longitude DECIMAL(11, 8) DEFAULT -8.783,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS na tabela drivers se não estiver habilitado
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas para a tabela drivers se não existirem
DO $$
BEGIN
  -- Política para leitura pública (passageiros podem ver localização)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'drivers' 
    AND policyname = 'Public can view driver location'
  ) THEN
    CREATE POLICY "Public can view driver location"
      ON public.drivers
      FOR SELECT
      USING (true);
  END IF;

  -- Política para admins atualizarem
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'drivers' 
    AND policyname = 'Admins can update drivers'
  ) THEN
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
  END IF;

  -- Política para admins inserirem
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'drivers' 
    AND policyname = 'Admins can insert drivers'
  ) THEN
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
  END IF;
END $$;

-- 4. Adicionar o terceiro motorista de teste na tabela conductors
INSERT INTO public.conductors (id, name, whatsapp, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'Motorista Teste',
  '351965748022',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  whatsapp = EXCLUDED.whatsapp,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 5. Adicionar o motorista de teste na tabela active_conductors
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

-- 6. Adicionar o motorista de teste na tabela drivers para rastreamento
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

-- 7. Verificar resultado
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

-- 8. Mostrar estatísticas
SELECT 
  'Estatísticas:' as info,
  (SELECT COUNT(*) FROM public.conductors) as total_conductors,
  (SELECT COUNT(*) FROM public.active_conductors WHERE is_active = true) as active_conductors,
  (SELECT COUNT(*) FROM public.drivers) as total_drivers,
  (SELECT COUNT(*) FROM public.drivers WHERE is_active = true) as active_drivers; 