-- Remove duplicados mantendo só o registo mais recente por condutor
DELETE FROM active_conductors
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY conductor_id ORDER BY updated_at DESC, id DESC) AS rn
    FROM active_conductors
  ) t
  WHERE t.rn = 1
);

-- Adicionar restrição UNIQUE para garantir 1 registo por condutor
ALTER TABLE active_conductors
ADD CONSTRAINT unique_conductor_id UNIQUE (conductor_id);
