import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function showAllData() {
  try {
    console.log("🔗 Conectando ao Supabase...");
    console.log(`📊 URL: ${SUPABASE_URL}\n`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Tabelas com dados
    const tablesWithData = [
      { name: "reservations", title: "📋 RESERVAS" },
      { name: "tour_types", title: "🚗 TIPOS DE TOUR" },
      { name: "conductors", title: "👨‍💼 CONDUTORES" },
      { name: "active_conductors", title: "✅ CONDUTORES ATIVOS" },
    ];

    for (const table of tablesWithData) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`${table.title}`);
      console.log(`${"=".repeat(50)}`);

      const { data, error } = await supabase
        .from(table.name)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(`❌ Erro ao consultar ${table.name}: ${error.message}`);
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`📭 Nenhum registro encontrado em ${table.name}`);
        continue;
      }

      console.log(`✅ Encontrados ${data.length} registros:\n`);

      data.forEach((record, index) => {
        console.log(`📄 Registro ${index + 1}:`);
        console.log(JSON.stringify(record, null, 2));
        console.log(""); // Linha em branco
      });
    }

    // Mostrar tabelas vazias
    console.log(`\n${"=".repeat(50)}`);
    console.log("📭 TABELAS VAZIAS");
    console.log(`${"=".repeat(50)}`);

    const emptyTables = ["profiles", "tuk_tuk_availability", "blocked_periods"];
    for (const tableName of emptyTables) {
      console.log(`   • ${tableName}`);
    }

    console.log("\n✨ Consulta completa concluída!");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

showAllData();
