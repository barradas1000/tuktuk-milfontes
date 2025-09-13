import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { allowedAdmins } from "@/constants/allowedAdmins";
import { AuthContext } from "./AuthContextInstance";
import type { Profile, AuthContextType } from "./AuthContext.types";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user profile
        setTimeout(async () => {
          try {
            const { data: profileData, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (!error && profileData) {
              setProfile(profileData as Profile);
            }
          } catch (err) {
            console.error("Error fetching profile:", err);
          }
        }, 0);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Verifica se o email está na whitelist
    if (!allowedAdmins.includes(trimmedEmail)) {
      return {
        error: {
          message: "Email não autorizado para registo de administrador.",
        },
      };
    }

    // 2. Verifica se o email já existe na tabela 'profiles' (que espelha a 'auth.users')
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", trimmedEmail)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 'No rows found'
        // Erro inesperado ao consultar a base de dados
        console.error("Erro ao verificar perfil existente:", fetchError);
        return { error: { message: "Ocorreu um erro ao verificar o email. Tente novamente." } };
      }
      
      if (existingProfile) {
        // Se o perfil já existe, o utilizador já está registado
        return {
          error: {
            message: "Este email já está registado. Por favor, faça login ou recupere a senha.",
          },
        };
      }
    } catch (dbError) {
        console.error("Exceção ao verificar perfil:", dbError);
        return { error: { message: "Ocorreu um erro na base de dados. Tente novamente." } };
    }

    console.log("Attempting sign up for:", trimmedEmail);
    // Redirecionamento fixo para produção
    const redirectUrl = "https://tuktuk-milfontes.vercel.app/login";

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: "admin",
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    console.log("Signing out...");
    await supabase.auth.signOut();
    setProfile(null);
  };

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin" || (user?.email && allowedAdmins.includes(user.email));

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};