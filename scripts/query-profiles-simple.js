import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const SUPABASE_URL = 'https://cqnahwnnqzraqcslljaz.supabase.co';

// Chave anônima correta fornecida pelo usuário
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE';

async function queryProfiles() {
  try {
    console.log('🔗 Conectando ao Supabase...');
    console.log(`📊 URL: ${SUPABASE_URL}`);
    console.log('📊 Consultando dados da tabela "profiles"...\n');

    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Consultar todos os perfis
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao consultar profiles:', error);
      console.error('💡 Verifique se:');
      console.error('   1. A tabela "profiles" existe no seu projeto');
      console.error('   2. As políticas de segurança permitem leitura');
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 Nenhum perfil encontrado na tabela.');
      console.log('💡 Isso pode significar que:');
      console.log('   1. A tabela está vazia');
      console.log('   2. As políticas RLS estão bloqueando o acesso');
      console.log('   3. A tabela não existe ainda');
      return;
    }

    console.log(`✅ Encontrados ${data.length} perfis:\n`);

    // Mostrar dados formatados
    data.forEach((profile, index) => {
      console.log(`👤 Perfil ${index + 1}:`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Nome: ${profile.full_name || 'Não informado'}`);
      console.log(`   Email: ${profile.email || 'Não informado'}`);
      console.log(`   Role: ${profile.role || 'Não definido'}`);
      console.log(`   Criado em: ${profile.created_at || 'Não informado'}`);
      console.log(`   Atualizado em: ${profile.updated_at || 'Não informado'}`);
      console.log(''); // Linha em branco
    });

    // Estatísticas
    console.log('📈 Estatísticas:');
    const roles = data.reduce((acc, profile) => {
      const role = profile.role || 'Sem role';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    Object.entries(roles).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} usuário(s)`);
    });

    // Informações adicionais
    console.log('\n📊 Informações adicionais:');
    console.log(`   Total de perfis: ${data.length}`);
    console.log(`   Perfis com email: ${data.filter(p => p.email).length}`);
    console.log(`   Perfis com nome: ${data.filter(p => p.full_name).length}`);
    console.log(`   Perfis com role: ${data.filter(p => p.role).length}`);

    console.log('\n✨ Consulta concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar a consulta
queryProfiles();
 