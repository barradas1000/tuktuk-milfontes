// Script para testar atualização específica
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iweurnqdomiqlohvaoat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXVybnFkb21pcWxvaHZhb2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTU2MzIsImV4cCI6MjA2OTAzMTYzMn0.LdLnL_sluHpIs_7qS3c3nCqNOrT_G0RaS3vhawloQjc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpecificUpdate() {
  console.log('Testando atualização específica...');
  
  try {
    // Usar o ID do Diogo que está na active_conductors
    const conductorId = 'e4b3296c-13eb-4faa-aead-e246ddb2bf66';
    console.log('Atualizando condutor ID:', conductorId);
    
    // Primeiro verificar o estado atual
    const { data: currentData, error: fetchError } = await supabase
      .from('active_conductors')
      .select('is_active')
      .eq('conductor_id', conductorId)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar estado atual:', fetchError);
      return;
    }
    
    console.log('Estado atual:', currentData.is_active);
    
    // Testar atualização para true
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
      console.log('Atualização bem-sucedida! Dados retornados:', data);
      
      // Verificar se realmente foi atualizado
      const { data: updatedData, error: verifyError } = await supabase
        .from('active_conductors')
        .select('is_active')
        .eq('conductor_id', conductorId)
        .single();
      
      if (verifyError) {
        console.error('Erro ao verificar atualização:', verifyError);
      } else {
        console.log('Estado após atualização:', updatedData.is_active);
      }
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testSpecificUpdate();
