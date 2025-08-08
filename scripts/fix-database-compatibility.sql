-- Script para corrigir incompatibilidades entre código e tabelas existentes
-- Execute este script no SQL Editor do Supabase Dashboard APÓS executar o script de verificação

-- 1. Verificar se os condutores padrão existem, se não, criar
INSERT INTO public.conductors (id, name, whatsapp)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001',
  'Condutor 1',
  '351963496320'
WHERE NOT EXISTS (
  SELECT 1 FROM public.conductors 
  WHERE id = '550e8400-e29b-41d4-a716-446655440001'
);

INSERT INTO public.conductors (id, name, whatsapp)
SELECT 
  '550e8400-e29b-41d4-a716-446655440002',
  'Condutor 2',
  '351968784043'
WHERE NOT EXISTS (
  SELECT 1 FROM public.conductors 
  WHERE id = '550e8400-e29b-41d4-a716-446655440002'
);

-- 2. Verificar se há condutor ativo, se não, criar
INSERT INTO public.active_conductors (conductor_id, is_active)
SELECT 
  '550e8400-e29b-41d4-a716-446655440002',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.active_conductors 
  WHERE conductor_id = '550e8400-e29b-41d4-a716-446655440002'
  AND is_active = true
);

-- 3. Se a tabela active_conductors não tiver foreign key, criar
-- (Execute apenas se o script de verificação mostrar que não existe foreign key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'active_conductors_conductor_id_fkey'
    AND table_name = 'active_conductors'
  ) THEN
    ALTER TABLE public.active_conductors 
    ADD CONSTRAINT active_conductors_conductor_id_fkey 
    FOREIGN KEY (conductor_id) REFERENCES public.conductors(id);
  END IF;
END $$;

-- 4. Verificar se RLS está habilitado
ALTER TABLE public.conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas se não existirem
DO $$
BEGIN
  -- Políticas para conductors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conductors' 
    AND policyname = 'Admins can view all conductors'
  ) THEN
    CREATE POLICY "Admins can view all conductors"
      ON public.conductors
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conductors' 
    AND policyname = 'Admins can update conductors'
  ) THEN
    CREATE POLICY "Admins can update conductors"
      ON public.conductors
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

  -- Políticas para active_conductors
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'active_conductors' 
    AND policyname = 'Admins can view active conductors'
  ) THEN
    CREATE POLICY "Admins can view active conductors"
      ON public.active_conductors
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'active_conductors' 
    AND policyname = 'Admins can insert active conductors'
  ) THEN
    CREATE POLICY "Admins can insert active conductors"
      ON public.active_conductors
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

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'active_conductors' 
    AND policyname = 'Admins can update active conductors'
  ) THEN
    CREATE POLICY "Admins can update active conductors"
      ON public.active_conductors
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

  -- Políticas para blocked_periods
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_periods' 
    AND policyname = 'Admins can view blocked periods'
  ) THEN
    CREATE POLICY "Admins can view blocked periods"
      ON public.blocked_periods
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_periods' 
    AND policyname = 'Admins can insert blocked periods'
  ) THEN
    CREATE POLICY "Admins can insert blocked periods"
      ON public.blocked_periods
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

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_periods' 
    AND policyname = 'Admins can delete blocked periods'
  ) THEN
    CREATE POLICY "Admins can delete blocked periods"
      ON public.blocked_periods
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- 6. Verificar resultado final
SELECT 'Verificação final:' as info;
SELECT 'Condutores:' as table_name, COUNT(*) as count FROM public.conductors
UNION ALL
SELECT 'Condutores ativos:' as table_name, COUNT(*) as count FROM public.active_conductors WHERE is_active = true; 