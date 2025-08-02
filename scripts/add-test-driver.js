import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function addTestDriver() {
  try {
    console.log("🔗 Conectando ao Supabase...");
    console.log(`📊 URL: ${SUPABASE_URL}\n`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const testDriverId = "550e8400-e29b-41d4-a716-446655440003";
    const testDriverData = {
      id: testDriverId,
      name: "Motorista Teste",
      whatsapp: "351965748022",
      is_active: true,
    };

    console.log("🚗 ADICIONANDO MOTORISTA DE TESTE");
    console.log("=".repeat(50));

    // 1. Adicionar na tabela conductors
    console.log("\n1️⃣ Adicionando na tabela conductors...");
    const { data: conductorData, error: conductorError } = await supabase
      .from("conductors")
      .upsert(testDriverData, { onConflict: "id" })
      .select()
      .single();

    if (conductorError) {
      console.log(`❌ Erro ao adicionar conductor: ${conductorError.message}`);
    } else {
      console.log(`✅ Conductor adicionado: ${conductorData.name}`);
    }

    // 2. Adicionar na tabela active_conductors
    console.log("\n2️⃣ Adicionando na tabela active_conductors...");
    const { data: activeData, error: activeError } = await supabase
      .from("active_conductors")
      .upsert(
        {
          conductor_id: testDriverId,
          is_active: true,
          activated_at: new Date().toISOString(),
        },
        { onConflict: "conductor_id" }
      )
      .select()
      .single();

    if (activeError) {
      console.log(
        `❌ Erro ao adicionar active_conductor: ${activeError.message}`
      );
    } else {
      console.log(`✅ Active conductor adicionado`);
    }

    // 3. Verificar se a tabela drivers existe e adicionar
    console.log("\n3️⃣ Verificando tabela drivers...");
    const { data: driversData, error: driversError } = await supabase
      .from("drivers")
      .select("*")
      .limit(1);

    if (driversError) {
      console.log(
        `⚠️ Tabela drivers não existe ou não acessível: ${driversError.message}`
      );
      console.log("💡 Execute o script SQL para criar a tabela drivers");
    } else {
      console.log("✅ Tabela drivers existe, adicionando motorista...");

      const { data: driverData, error: driverInsertError } = await supabase
        .from("drivers")
        .upsert(
          {
            id: testDriverId,
            name: "Motorista Teste",
            is_active: false, // Começa inativo
            latitude: 37.725,
            longitude: -8.783,
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (driverInsertError) {
        console.log(
          `❌ Erro ao adicionar driver: ${driverInsertError.message}`
        );
      } else {
        console.log(`✅ Driver adicionado: ${driverData.name}`);
      }
    }

    // 4. Verificar resultado final
    console.log("\n4️⃣ Verificando resultado final...");

    // Verificar condutores
    const { data: allConductors, error: conductorsListError } = await supabase
      .from("conductors")
      .select("*")
      .order("created_at");

    if (!conductorsListError && allConductors) {
      console.log(`\n📋 Total de condutores: ${allConductors.length}`);
      allConductors.forEach((conductor, index) => {
        console.log(
          `   ${index + 1}. ${conductor.name} (${conductor.whatsapp}) - ${
            conductor.is_active ? "✅ Ativo" : "❌ Inativo"
          }`
        );
      });
    }

    // Verificar condutores ativos
    const { data: activeConductors, error: activeListError } = await supabase
      .from("active_conductors")
      .select(
        `
        *,
        conductors(name, whatsapp)
      `
      )
      .eq("is_active", true);

    if (!activeListError && activeConductors) {
      console.log(`\n✅ Condutores ativos: ${activeConductors.length}`);
      activeConductors.forEach((active, index) => {
        const conductor = active.conductors;
        console.log(
          `   ${index + 1}. ${conductor?.name} (${conductor?.whatsapp})`
        );
      });
    }

    // Verificar drivers se a tabela existir
    if (!driversError) {
      const { data: allDrivers, error: driversListError } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at");

      if (!driversListError && allDrivers) {
        console.log(`\n🚗 Total de drivers: ${allDrivers.length}`);
        allDrivers.forEach((driver, index) => {
          console.log(
            `   ${index + 1}. ${driver.name} - ${
              driver.is_active ? "✅ Ativo" : "❌ Inativo"
            }`
          );
        });
      }
    }

    console.log("\n✨ Motorista de teste adicionado com sucesso!");
    console.log("\n📱 Informações do motorista:");
    console.log(`   Nome: Motorista Teste`);
    console.log(`   WhatsApp: 351965748022`);
    console.log(`   ID: ${testDriverId}`);
    console.log(`   Status: Ativo para reservas, inativo para rastreamento`);
    console.log(
      "\n💡 Para ativar o rastreamento, acesse o dashboard do motorista"
    );
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

// Executar o script
addTestDriver();
