import { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  whatsapp?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: { message: string } | Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}