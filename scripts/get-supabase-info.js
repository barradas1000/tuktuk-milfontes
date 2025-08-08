import { execSync } from "child_process";

const SUPABASE_ACCESS_TOKEN = "sbp_2bbbe40058bd8df78e1fb35c7c114b84279e1b55";
const PROJECT_REF = "cqnahwnnqzraqcslljaz";

async function getSupabaseInfo() {
  try {
    console.log("🔗 Obtendo informações do projeto Supabase...\n");

    // Definir o token de acesso
    process.env.SUPABASE_ACCESS_TOKEN = SUPABASE_ACCESS_TOKEN;

    // Obter informações do projeto
    console.log("📊 Informações do projeto:");
    try {
      const projectInfo = execSync(
        `npx supabase projects list --access-token ${SUPABASE_ACCESS_TOKEN}`,
        { encoding: "utf8" }
      );
      console.log(projectInfo);
    } catch (error) {
      console.log("❌ Erro ao obter informações do projeto:", error.message);
    }

    // Tentar obter as chaves do projeto
    console.log("\n🔑 Obtendo chaves do projeto:");
    try {
      const keys = execSync(
        `npx supabase projects api-keys --project-ref ${PROJECT_REF} --access-token ${SUPABASE_ACCESS_TOKEN}`,
        { encoding: "utf8" }
      );
      console.log(keys);
    } catch (error) {
      console.log("❌ Erro ao obter chaves:", error.message);
    }

    // Tentar listar tabelas
    console.log("\n📋 Listando tabelas do projeto:");
    try {
      const tables = execSync(
        `npx supabase db tables --project-ref ${PROJECT_REF} --access-token ${SUPABASE_ACCESS_TOKEN}`,
        { encoding: "utf8" }
      );
      console.log(tables);
    } catch (error) {
      console.log("❌ Erro ao listar tabelas:", error.message);
    }
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}

getSupabaseInfo();
