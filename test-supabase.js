// Script simples para testar conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iweurnqdomiqlohvaoat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXVybnFkb21pcWxvaHZhb2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTU2MzIsImV4cCI6MjA2OTAzMTYzMn0.LdLnL_sluHpIs_7qS3c3nCqNOrT_G0RaS3vhawloQjc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testando conexão com Supabase...');
  
  try {
    // Testar se a tabela active_conductors existe
    const { data, error } = await supabase
      .from('active_conductors')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao acessar tabela active_conductors:', error);
      return;
    }
    
    console.log('Tabela active_conductors existe. Dados:', data);
    
    // Testar se a tabela conductors existe
    const { data: conductorsData, error: conductorsError } = await supabase
      .from('conductors')
      .select('*')
      .limit(1);
    
    if (conductorsError) {
      console.error('Erro ao acessar tabela conductors:', conductorsError);
      return;
    }
    
    console.log('Tabela conductors existe. Dados:', conductorsData);
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testConnection();
