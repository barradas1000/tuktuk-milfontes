-- Adiciona as colunas 'status' e 'busy_until' na tabela conductors
ALTER TABLE conductors
ADD COLUMN status text DEFAULT 'disponivel',
ADD COLUMN busy_until timestamptz;
