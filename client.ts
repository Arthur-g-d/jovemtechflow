// Cliente Supabase com configuração via variáveis de ambiente.
// Antes: URL e chave anon estavam hardcoded no repositório (CRIT-02).
// Agora: lidos de import.meta.env e validados em runtime.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Faltam variáveis de ambiente do Supabase. " +
      "Crie um arquivo .env.local na raiz do projeto com VITE_SUPABASE_URL e " +
      "VITE_SUPABASE_ANON_KEY (veja .env.example).",
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
