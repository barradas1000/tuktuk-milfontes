// Script para testar atualização de condutor
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iweurnqdomiqlohvaoat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXVybnFkb21pcWxvaHZhb2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTU2MzIsImV4cCI6MjA2OTAzMTYzMn0.LdLnL_sluHpIs_7qS3c3nCqNOrT_G0RaS3vhawloQjc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('Testando atualização de condutor...');
  
  try {
    // Primeiro, buscar um condutor para testar
    const { data: conductors, error: fetchError } = await supabase
      .from('conductors')
      .select('id')
      .limit(1);
    
    if (fetchError || !conductors || conductors.length === 0) {
      console.error('Erro ao buscar condutores:', fetchError);
      return;
    }
    
    const conductorId = conductors[0].id;
    console.log('Testando com condutor ID:', conductorId);
    
    // Testar atualização
    const { data, error } = await supabase
      .from('active_conductors')
      .update({ 
        is_active: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('conductor_id', conductorId)
      .select();
    
    console.log('Resultado da atualização:', { data, error });
    
    if (error) {
      console.error('Erro detalhado:', error);
    } else {
      console.log('Atualização bem-sucedida!');
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testUpdate();
