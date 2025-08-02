import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const SUPABASE_URL = "https://cqnahwnnqzraqcslljaz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmFod25ucXpyYXFjc2xsamF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE1NDQsImV4cCI6MjA2NzA1NzU0NH0.3lW9juEq0C8Vq737Og56-aXMGVtLfkB58tjYRwKMnhE";

async function testProfilesAccess() {
  try {
    console.log("🔍 TESTANDO ACESSO À TABELA PROFILES");
    console.log("=".repeat(50));

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Teste 1: Verificar se há usuários autenticados
    console.log("\n1️⃣ Verificando usuários autenticados...");
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.log(`❌ Erro ao listar usuários: ${usersError.message}`);
    } else {
      console.log(`📊 Total de usuários: ${users ? users.length : 0}`);
      if (users && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`\n👤 Usuário ${index + 1}:`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Criado em: ${user.created_at}`);
          console.log(`   Último login: ${user.last_sign_in_at || "Nunca"}`);
        });
      }
    }

    // Teste 2: Tentar consultar com diferentes contextos
    console.log("\n2️⃣ Testando consultas com diferentes contextos...");

    // Consulta 1: Sem autenticação
    const { data: anonData, error: anonError } = await supabase
      .from("profiles")
      .select("*");

    console.log(`📊 Anônimo: ${anonData ? anonData.length : 0} registros`);
    if (anonError) console.log(`❌ Erro anônimo: ${anonError.message}`);

    // Teste 3: Verificar se há políticas RLS
    console.log("\n3️⃣ Verificando políticas RLS...");

    // Tentar inserir um registro de teste (deve falhar se RLS estiver ativo)
    const testProfile = {
      id: "test-" + Date.now(),
      full_name: "Test User",
      email: "test@example.com",
      role: "user",
    };

    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .insert(testProfile);

    if (insertError) {
      console.log(`📝 RLS ativo - Inserção bloqueada: ${insertError.message}`);
    } else {
      console.log(`⚠️ RLS inativo - Inserção permitida`);
    }

    // Teste 4: Tentar consultar com filtros específicos
    console.log("\n4️⃣ Testando consultas com filtros...");

    const { data: filterData, error: filterError } = await supabase
      .from("profiles")
      .select("*")
      .not("id", "is", null);

    console.log(
      `📊 Com filtro: ${filterData ? filterData.length : 0} registros`
    );
    if (filterError) console.log(`❌ Erro com filtro: ${filterError.message}`);

    // Teste 5: Verificar se a tabela existe no schema correto
    console.log("\n5️⃣ Verificando schema da tabela...");

    const { data: schemaData, error: schemaError } = await supabase
      .from("information_schema.tables")
      .select("table_name, table_schema")
      .eq("table_name", "profiles");

    if (schemaError) {
      console.log(`❌ Erro ao verificar schema: ${schemaError.message}`);
    } else {
      console.log(`📋 Tabelas encontradas:`);
      if (schemaData && schemaData.length > 0) {
        schemaData.forEach((table) => {
          console.log(`   • ${table.table_schema}.${table.table_name}`);
        });
      } else {
        console.log(`   • Nenhuma tabela 'profiles' encontrada`);
      }
    }

    console.log("\n✨ Testes concluídos!");
    console.log("\n💡 CONCLUSÕES:");
    console.log("   • Se você vê 3 registros no dashboard, mas 0 aqui,");
    console.log("     as políticas RLS estão bloqueando o acesso anônimo");
    console.log("   • Para ver os dados, você precisa:");
    console.log("     1. Autenticar um usuário, ou");
    console.log("     2. Modificar as políticas RLS, ou");
    console.log("     3. Usar a chave de serviço (service_role)");
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

testProfilesAccess();
