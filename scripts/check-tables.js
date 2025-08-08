import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function checkTables() {
  try {
    console.log("🔗 Conectando ao Supabase...");
    console.log(`📊 URL: ${SUPABASE_URL}\n`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Lista de tabelas que sabemos que existem baseado no arquivo types.ts
    const knownTables = [
      "profiles",
      "reservations",
      "tour_types",
      "tuk_tuk_availability",
      "conductors",
      "active_conductors",
      "blocked_periods",
    ];

    console.log("📋 Verificando tabelas conhecidas...\n");

    for (const tableName of knownTables) {
      try {
        console.log(`🔍 Testando tabela: ${tableName}`);

        // Tentar fazer uma consulta simples
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (error) {
          console.log(`   ❌ Erro: ${error.message}`);
        } else {
          const count = data ? data.length : 0;
          console.log(`   ✅ Acessível - ${count} registros encontrados`);
        }
      } catch (error) {
        console.log(`   ❌ Erro inesperado: ${error.message}`);
      }
    }

    console.log("\n🔍 Testando consulta específica na tabela profiles...");

    // Testar diferentes consultas na tabela profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.log(`❌ Erro ao consultar profiles: ${profilesError.message}`);
      console.log(`📝 Código do erro: ${profilesError.code}`);
      console.log(`📝 Detalhes: ${profilesError.details}`);
    } else {
      console.log(`✅ Tabela profiles acessível`);
      console.log(
        `📊 Total de registros: ${profilesData ? profilesData.length : 0}`
      );

      if (profilesData && profilesData.length > 0) {
        console.log("\n📋 Primeiro registro:");
        console.log(JSON.stringify(profilesData[0], null, 2));
      }
    }

    console.log("\n✨ Verificação concluída!");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

checkTables();
