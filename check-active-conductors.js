// Script para verificar registros na tabela active_conductors
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iweurnqdomiqlohvaoat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXVybnFkb21pcWxvaHZhb2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTU2MzIsImV4cCI6MjA2OTAzMTYzMn0.LdLnL_sluHpIs_7qS3c3nCqNOrT_G0RaS3vhawloQjc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActiveConductors() {
  console.log('Verificando registros na tabela active_conductors...');
  
  try {
    // Buscar todos os registros
    const { data, error } = await supabase
      .from('active_conductors')
      .select('id, conductor_id, is_active, name')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar registros:', error);
      return;
    }
    
    console.log('Registros encontrados:', data.length);
    console.log('Detalhes dos registros:');
    data.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, Conductor ID: ${record.conductor_id}, Ativo: ${record.is_active}, Nome: ${record.name}`);
    });
    
    // Verificar também os condutores disponíveis
    const { data: conductors, error: conductorsError } = await supabase
      .from('conductors')
      .select('id, name, is_active')
      .order('name');
    
    if (conductorsError) {
      console.error('Erro ao buscar condutores:', conductorsError);
      return;
    }
    
    console.log('\nCondutores disponíveis:');
    conductors.forEach((conductor, index) => {
      console.log(`${index + 1}. ID: ${conductor.id}, Nome: ${conductor.name}, Ativo: ${conductor.is_active}`);
    });
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

checkActiveConductors();
