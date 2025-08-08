import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function showActiveConductors() {
  try {
    console.log("🔗 Conectando ao Supabase...");
    console.log(`📊 URL: ${SUPABASE_URL}\n`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log("✅ CONDUTORES ATIVOS");
    console.log("=".repeat(50));

    // Consultar active_conductors sem ordenar por created_at
    const { data, error } = await supabase
      .from("active_conductors")
      .select("*");

    if (error) {
      console.log(`❌ Erro ao consultar active_conductors: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.log("📭 Nenhum condutor ativo encontrado");
      return;
    }

    console.log(`✅ Encontrados ${data.length} condutores ativos:\n`);

    data.forEach((record, index) => {
      console.log(`📄 Condutor Ativo ${index + 1}:`);
      console.log(JSON.stringify(record, null, 2));
      console.log(""); // Linha em branco
    });

    console.log("✨ Consulta concluída!");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

showActiveConductors();
