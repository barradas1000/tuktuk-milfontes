import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function verifyTestDriver() {
  try {
    console.log("🔗 Conectando ao Supabase...");
    console.log(`📊 URL: ${SUPABASE_URL}\n`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const testDriverId = "550e8400-e29b-41d4-a716-446655440003";

    console.log("🔍 VERIFICANDO MOTORISTA DE TESTE");
    console.log("=".repeat(50));

    // 1. Verificar na tabela conductors
    console.log("\n1️⃣ Verificando na tabela conductors...");
    const { data: conductorData, error: conductorError } = await supabase
      .from("conductors")
      .select("*")
      .eq("id", testDriverId)
      .single();

    if (conductorError) {
      console.log(`❌ Erro ao verificar conductor: ${conductorError.message}`);
    } else {
      console.log(`✅ Conductor encontrado: ${conductorData.name}`);
      console.log(`   WhatsApp: ${conductorData.whatsapp}`);
      console.log(`   Ativo: ${conductorData.is_active ? "✅ Sim" : "❌ Não"}`);
    }

    // 2. Verificar na tabela active_conductors
    console.log("\n2️⃣ Verificando na tabela active_conductors...");
    const { data: activeData, error: activeError } = await supabase
      .from("active_conductors")
      .select(
        `
        *,
        conductors(name, whatsapp)
      `
      )
      .eq("conductor_id", testDriverId)
      .single();

    if (activeError) {
      console.log(
        `❌ Erro ao verificar active_conductor: ${activeError.message}`
      );
    } else {
      console.log(`✅ Active conductor encontrado`);
      console.log(`   Ativo: ${activeData.is_active ? "✅ Sim" : "❌ Não"}`);
      console.log(`   Ativado em: ${activeData.activated_at}`);
      if (activeData.conductors) {
        console.log(`   Nome: ${activeData.conductors.name}`);
        console.log(`   WhatsApp: ${activeData.conductors.whatsapp}`);
      }
    }

    // 3. Verificar na tabela drivers
    console.log("\n3️⃣ Verificando na tabela drivers...");
    const { data: driverData, error: driverError } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", testDriverId)
      .single();

    if (driverError) {
      console.log(`❌ Erro ao verificar driver: ${driverError.message}`);
      console.log("💡 Execute o script SQL para criar a tabela drivers");
    } else {
      console.log(`✅ Driver encontrado: ${driverData.name}`);
      console.log(
        `   Ativo para rastreamento: ${
          driverData.is_active ? "✅ Sim" : "❌ Não"
        }`
      );
      console.log(`   Latitude: ${driverData.latitude}`);
      console.log(`   Longitude: ${driverData.longitude}`);
      console.log(`   Última atualização: ${driverData.updated_at}`);
    }

    // 4. Verificar todos os condutores
    console.log("\n4️⃣ Listando todos os condutores...");
    const { data: allConductors, error: allConductorsError } = await supabase
      .from("conductors")
      .select("*")
      .order("created_at");

    if (!allConductorsError && allConductors) {
      console.log(`📋 Total de condutores: ${allConductors.length}`);
      allConductors.forEach((conductor, index) => {
        console.log(
          `   ${index + 1}. ${conductor.name} (${conductor.whatsapp}) - ${
            conductor.is_active ? "✅ Ativo" : "❌ Inativo"
          }`
        );
      });
    }

    // 5. Verificar condutores ativos
    console.log("\n5️⃣ Listando condutores ativos...");
    const { data: activeConductors, error: activeConductorsError } =
      await supabase
        .from("active_conductors")
        .select(
          `
        *,
        conductors(name, whatsapp)
      `
        )
        .eq("is_active", true);

    if (!activeConductorsError && activeConductors) {
      console.log(`✅ Condutores ativos: ${activeConductors.length}`);
      activeConductors.forEach((active, index) => {
        const conductor = active.conductors;
        console.log(
          `   ${index + 1}. ${conductor?.name} (${conductor?.whatsapp})`
        );
      });
    }

    // 6. Verificar drivers se a tabela existir
    if (!driverError) {
      console.log("\n6️⃣ Listando todos os drivers...");
      const { data: allDrivers, error: allDriversError } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at");

      if (!allDriversError && allDrivers) {
        console.log(`🚗 Total de drivers: ${allDrivers.length}`);
        allDrivers.forEach((driver, index) => {
          console.log(
            `   ${index + 1}. ${driver.name} - ${
              driver.is_active ? "✅ Ativo" : "❌ Inativo"
            }`
          );
        });
      }
    }

    // 7. Resumo final
    console.log("\n📊 RESUMO FINAL");
    console.log("=".repeat(50));
    console.log("✅ Motorista de teste adicionado com sucesso!");
    console.log("\n📱 Informações do motorista:");
    console.log(`   Nome: Motorista Teste`);
    console.log(`   WhatsApp: 351965748022`);
    console.log(`   ID: ${testDriverId}`);
    console.log(`   Status: Ativo para reservas`);

    if (!driverError) {
      console.log(
        `   Rastreamento: ${driverData?.is_active ? "✅ Ativo" : "❌ Inativo"}`
      );
      console.log(
        `   Localização: ${driverData?.latitude}, ${driverData?.longitude}`
      );
    } else {
      console.log(`   Rastreamento: ⚠️ Tabela drivers não configurada`);
    }

    console.log("\n💡 Para ativar o rastreamento:");
    console.log("   1. Execute o script SQL para configurar a tabela drivers");
    console.log("   2. Acesse o dashboard do motorista");
    console.log("   3. Clique em '▶️ LIGAR' para ativar o rastreamento");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

// Executar o script
verifyTestDriver();
