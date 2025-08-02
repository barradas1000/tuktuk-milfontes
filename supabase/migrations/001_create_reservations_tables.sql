
-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  number_of_people INTEGER NOT NULL CHECK (number_of_people >= 1 AND number_of_people <= 6),
  tour_type VARCHAR(100) NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tuk_tuk_availability table
CREATE TABLE IF NOT EXISTS tuk_tuk_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tuk_tuk_id VARCHAR(50) NOT NULL,
  available_date DATE NOT NULL,
  time_slots JSONB NOT NULL DEFAULT '{}',
  max_capacity INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tuk_tuk_id, available_date)
);

-- Create tour_types table
CREATE TABLE IF NOT EXISTS tour_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  max_people INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tour types
INSERT INTO tour_types (name, description, duration_minutes, base_price, max_people) VALUES
('Passeio panorâmico pela vila', 'Percurso panorâmico pelos principais pontos da vila', 60, 10.00, 4),
('Vila Nova de Milfontes → Praia das Furnas', 'Travessia pela ponte com vista panorâmica sobre o rio Mira', 90, 14.00, 4),
('Travessia pela ponte', 'Atravessia da ponte com vista sobre o rio Mira', 45, 10.00, 4),
('Pôr-do-Sol Romântico', 'Passeio panorâmico com garrafa de vinho e frutos secos', 120, 25.00, 2),
('Passeio noturno', 'Percurso panorâmico pelas ruas iluminadas', 90, 8.00, 4),
('Rota dos Pescadores', 'Passeio até ao farol com vista para o mar', 75, 10.00, 4);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for reservations table
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuk_tuk_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON reservations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON reservations FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON tuk_tuk_availability FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON tuk_tuk_availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tuk_tuk_availability FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON tour_types FOR SELECT USING (true);
