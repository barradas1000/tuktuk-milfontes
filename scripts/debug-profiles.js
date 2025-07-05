import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function debugProfiles() {
  try {
    console.log("🔍 INVESTIGANDO TABELA PROFILES");
    console.log("=".repeat(50));

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Teste 1: Consulta básica
    console.log("\n1️⃣ Teste 1: Consulta básica");
    const { data: basicData, error: basicError } = await supabase
      .from("profiles")
      .select("*");

    if (basicError) {
      console.log(`❌ Erro: ${basicError.message}`);
      console.log(`📝 Código: ${basicError.code}`);
      console.log(`📝 Detalhes: ${basicError.details}`);
    } else {
      console.log(`✅ Sucesso: ${basicData ? basicData.length : 0} registros`);
    }

    // Teste 2: Contagem
    console.log("\n2️⃣ Teste 2: Contagem de registros");
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log(`❌ Erro na contagem: ${countError.message}`);
    } else {
      console.log(`📊 Total de registros: ${count}`);
    }

    // Teste 3: Consulta com limite
    console.log("\n3️⃣ Teste 3: Consulta com limite 10");
    const { data: limitData, error: limitError } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    if (limitError) {
      console.log(`❌ Erro: ${limitError.message}`);
    } else {
      console.log(
        `✅ Registros encontrados: ${limitData ? limitData.length : 0}`
      );
      if (limitData && limitData.length > 0) {
        console.log("\n📋 Primeiros registros:");
        limitData.forEach((profile, index) => {
          console.log(`\n👤 Perfil ${index + 1}:`);
          console.log(`   ID: ${profile.id}`);
          console.log(`   Nome: ${profile.full_name || "Não informado"}`);
          console.log(`   Email: ${profile.email || "Não informado"}`);
          console.log(`   Role: ${profile.role || "Não definido"}`);
          console.log(`   Criado em: ${profile.created_at || "Não informado"}`);
          console.log(
            `   Atualizado em: ${profile.updated_at || "Não informado"}`
          );
        });
      }
    }

    // Teste 4: Consulta específica por ID
    console.log("\n4️⃣ Teste 4: Tentando consultar por ID específico");
    const { data: idData, error: idError } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Excluir ID inválido

    if (idError) {
      console.log(`❌ Erro: ${idError.message}`);
    } else {
      console.log(`✅ Registros válidos: ${idData ? idData.length : 0}`);
    }

    // Teste 5: Verificar estrutura da tabela
    console.log("\n5️⃣ Teste 5: Verificar estrutura da tabela");
    const { data: structureData, error: structureError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, updated_at")
      .limit(1);

    if (structureError) {
      console.log(`❌ Erro na estrutura: ${structureError.message}`);
    } else {
      console.log(
        `✅ Estrutura válida: ${
          structureData ? structureData.length : 0
        } registros`
      );
    }

    // Teste 6: Consulta com autenticação
    console.log("\n6️⃣ Teste 6: Verificar sessão atual");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.log(`❌ Erro na sessão: ${sessionError.message}`);
    } else {
      console.log(`📊 Sessão: ${session ? "Ativa" : "Não autenticado"}`);
      if (session) {
        console.log(`👤 Usuário: ${session.user.email}`);
      }
    }

    console.log("\n✨ Investigação concluída!");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

debugProfiles();
