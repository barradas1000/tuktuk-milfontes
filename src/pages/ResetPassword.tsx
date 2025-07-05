import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Captura a sessão da URL usando getSessionFromUrl()
  useEffect(() => {
    const handleSessionFromUrl = async () => {
      console.log("ResetPassword - URL:", window.location.href);
      console.log("ResetPassword - search params:", location.search);
      console.log("ResetPassword - hash:", window.location.hash);

      // Verifica se há parâmetros na URL
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      console.log("URL Params:", Object.fromEntries(urlParams.entries()));
      console.log("Hash Params:", Object.fromEntries(hashParams.entries()));

      try {
        // Primeiro, tenta o método oficial do Supabase
        const { data, error } = await supabase.auth.getSessionFromUrl();

        if (error) {
          console.error("Erro ao obter sessão da URL:", error);
          console.error("Detalhes do erro:", {
            message: error.message,
            status: error.status,
            name: error.name,
          });

          // Tenta método alternativo se o primeiro falhar
          console.log("Tentando método alternativo...");
          const accessToken =
            urlParams.get("access_token") || hashParams.get("access_token");
          const type = urlParams.get("type") || hashParams.get("type");

          if (accessToken && type === "recovery") {
            console.log("Token encontrado via método alternativo");
            setIsValidSession(true);
            return;
          }

          setError("Link inválido ou expirado. " + error.message);
          setIsValidSession(false);
        } else if (data.session) {
          console.log("Sessão válida obtida:", data.session);
          console.log("User ID:", data.session.user.id);
          console.log(
            "Access Token:",
            data.session.access_token ? "Presente" : "Ausente"
          );
          setIsValidSession(true);
        } else {
          console.log("Nenhuma sessão encontrada na URL");
          console.log("Data recebida:", data);

          // Tenta método alternativo
          const accessToken =
            urlParams.get("access_token") || hashParams.get("access_token");
          const type = urlParams.get("type") || hashParams.get("type");

          if (accessToken && type === "recovery") {
            console.log("Token encontrado via método alternativo");
            setIsValidSession(true);
            return;
          }

          setError(
            "Link inválido ou expirado. Nenhuma sessão válida encontrada."
          );
          setIsValidSession(false);
        }
      } catch (err) {
        console.error("Erro inesperado ao processar URL:", err);
        console.error("Tipo do erro:", typeof err);
        console.error("Stack trace:", err instanceof Error ? err.stack : "N/A");

        // Última tentativa com método alternativo
        const accessToken =
          urlParams.get("access_token") || hashParams.get("access_token");
        const type = urlParams.get("type") || hashParams.get("type");

        if (accessToken && type === "recovery") {
          console.log("Token encontrado via método alternativo após erro");
          setIsValidSession(true);
          return;
        }

        setError(
          "Erro ao processar link de recuperação. Tente novamente ou solicite um novo link."
        );
        setIsValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    handleSessionFromUrl();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError("Preencha ambos os campos de senha.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!isValidSession) {
      setError("Sessão inválida. Solicite um novo link de recuperação.");
      return;
    }

    setLoading(true);
    try {
      // Atualiza a senha usando a sessão atual
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("Update user error:", error);
        setError("Erro ao redefinir senha: " + error.message);
      } else {
        setSuccess(
          "Senha redefinida com sucesso! Faça login com a nova senha."
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Erro inesperado ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  // Mostra loading enquanto verifica a sessão
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Redefinir Senha</h1>
          <p className="text-gray-600 mt-2">
            Defina uma nova senha para sua conta
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Nova Senha</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            {isValidSession && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-6 space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar ao login
          </Button>
          {error && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700"
              >
                Solicitar novo link de recuperação
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
