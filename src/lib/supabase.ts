import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const envOk = !!supabaseUrl && !!supabaseAnonKey;

// Tipagens mínimas para um cliente "like" do Supabase usadas pela app
interface MinimalChannel {
  on: (event: "postgres_changes" | "system", ...args: unknown[]) => MinimalChannel;
  subscribe: () => MinimalChannel;
}

interface MinimalPostgrestBuilder<T> {
  select: (columns?: string) => MinimalPostgrestBuilder<T>;
  eq: (column: string, value: unknown) => MinimalPostgrestBuilder<T>;
  maybeSingle: () => Promise<{ data: T | null; error: null }>;
}

interface MinimalSupabaseLike {
  channel: (name: string) => MinimalChannel;
  removeChannel: (ch: MinimalChannel) => void;
  from: (table: string) => MinimalPostgrestBuilder<unknown>;
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>;
  };
}

// Fallback stub para ambiente local sem variáveis – evita crash no import
function createNoopSupabase(): MinimalSupabaseLike {
  const noop = () => undefined;
  const noopChannel: MinimalChannel = {
    on: (event: "postgres_changes" | "system", ...args: unknown[]) => noopChannel,
    subscribe: () => noopChannel,
  };
  return {
    channel: () => noopChannel,
    removeChannel: noop,
    from: () => {
      // Devolve um builder encadeável com finais assíncronos inertes
      const builder: MinimalPostgrestBuilder<unknown> = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: async () => ({ data: null, error: null }),
      };
      return builder;
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  };
}

// Criar uma única instância do Supabase para toda a aplicação, apenas se env ok
export const supabase = envOk
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
      auth: {
        storageKey: "tuktuk-milfontes-auth",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: { "X-Client-Info": "tuktuk-milfontes-web" },
      },
    })
  : (createNoopSupabase() as unknown as ReturnType<typeof createClient>);

// Aviso amigável no ambiente sem configuração
if (!envOk) {
  console.warn("⚠️ Variáveis de ambiente do Supabase não configuradas!");
  console.warn(
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias para funcionalidades online. A executar em modo offline."
  );
}
