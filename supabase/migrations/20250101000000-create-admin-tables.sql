-- Create conductors table
CREATE TABLE public.conductors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_conductors table to track which conductors are currently active
CREATE TABLE public.active_conductors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conductor_id UUID NOT NULL REFERENCES public.conductors(id),
  is_active BOOLEAN DEFAULT true,
  session_start TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_periods table
CREATE TABLE public.blocked_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL, -- format: yyyy-MM-dd
  start_time TEXT, -- format: HH:mm, optional for full day blocks
  end_time TEXT, -- format: HH:mm, optional for full day blocks
  reason TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default conductors
INSERT INTO public.conductors (id, name, whatsapp) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Condutor 1', '351963496320'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Condutor 2', '351968784043');

-- Insert default active conductor (condutor2)
INSERT INTO public.active_conductors (conductor_id, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', true);

-- Enable RLS on all tables
ALTER TABLE public.conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

-- Create policies for conductors table
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

-- Create policies for active_conductors table
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

-- Create policies for blocked_periods table
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