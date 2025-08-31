// Script para verificar políticas RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iweurnqdomiqlohvaoat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZXVybnFkb21pcWxvaHZhb2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTU2MzIsImV4cCI6MjA2OTAzMTYzMn0.LdLnL_sluHpIs_7qS3c3nCqNOrT_G0RaS3vhawloQjc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  console.log('Verificando políticas RLS...');
  
  try {
    // Testar com uma chave de serviço (se disponível) para ver se é problema de RLS
    // Primeiro testar com chave anônima atual
    console.log('Testando com chave anônima...');
    
    const { data: anonData, error: anonError } = await supabase
      .from('active_conductors')
      .update({ is_active: true })
      .eq('conductor_id', 'e4b3296c-13eb-4faa-aead-e246ddb2bf66')
      .select();
    
    console.log('Resultado com chave anônima:', { data: anonData, error: anonError });
    
    // Testar uma inserção para ver se funciona
    console.log('\nTestando inserção...');
    const { data: insertData, error: insertError } = await supabase
      .from('active_conductors')
      .insert({
        conductor_id: 'e4b3296c-13eb-4faa-aead-e246ddb2bf66',
        is_active: true,
        name: 'Teste RLS'
      })
      .select();
    
    console.log('Resultado da inserção:', { data: insertData, error: insertError });
    
    // Testar uma consulta simples
    console.log('\nTestando consulta...');
    const { data: queryData, error: queryError } = await supabase
      .from('active_conductors')
      .select('*')
      .limit(1);
    
    console.log('Resultado da consulta:', { data: queryData, error: queryError });
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

checkRLS();
