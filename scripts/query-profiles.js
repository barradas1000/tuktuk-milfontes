import { createClient } from "@supabase/supabase-js";
import readline from "readline";

// Interface para leitura de input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Função para perguntar ao usuário
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getSupabaseCredentials() {
  // Tentar obter das variáveis de ambiente primeiro
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  // Se não estiverem definidas, pedir ao usuário
  if (!supabaseUrl) {
    console.log(
      "🔧 Configuração do Supabase não encontrada nas variáveis de ambiente."
    );
    supabaseUrl = await askQuestion(
      "📝 Digite a URL do seu projeto Supabase: "
    );
  }

  if (!supabaseKey) {
    supabaseKey = await askQuestion(
      "🔑 Digite a chave anônima (anon key) do Supabase: "
    );
  }

  return { supabaseUrl, supabaseKey };
}

async function queryProfiles() {
  try {
    console.log("🔗 Conectando ao Supabase...\n");

    // Obter credenciais
    const { supabaseUrl, supabaseKey } = await getSupabaseCredentials();

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Credenciais do Supabase são obrigatórias!");
      rl.close();
      return;
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📊 Consultando dados da tabela "profiles"...\n');

    // Consultar todos os perfis
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erro ao consultar profiles:", error);
      console.error("💡 Verifique se:");
      console.error("   1. As credenciais estão corretas");
      console.error('   2. A tabela "profiles" existe no seu projeto');
      console.error("   3. As políticas de segurança permitem leitura");
      rl.close();
      return;
    }

    if (!data || data.length === 0) {
      console.log("📭 Nenhum perfil encontrado na tabela.");
      rl.close();
      return;
    }

    console.log(`✅ Encontrados ${data.length} perfis:\n`);

    // Mostrar dados formatados
    data.forEach((profile, index) => {
      console.log(`👤 Perfil ${index + 1}:`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Nome: ${profile.full_name || "Não informado"}`);
      console.log(`   Email: ${profile.email || "Não informado"}`);
      console.log(`   Role: ${profile.role || "Não definido"}`);
      console.log(`   Criado em: ${profile.created_at || "Não informado"}`);
      console.log(`   Atualizado em: ${profile.updated_at || "Não informado"}`);
      console.log(""); // Linha em branco
    });

    // Estatísticas
    console.log("📈 Estatísticas:");
    const roles = data.reduce((acc, profile) => {
      const role = profile.role || "Sem role";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    Object.entries(roles).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} usuário(s)`);
    });

    console.log("\n✨ Consulta concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  } finally {
    rl.close();
  }
}

// Executar a consulta
queryProfiles();
