import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/admin");
    }
  }, [user, loading, navigate]);

  // Clear errors when switching tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(loginEmail, loginPassword);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Por favor, confirme seu email antes de fazer login");
        } else {
          setError(error.message);
        }
      } else {
        navigate("/admin");
      }
    } catch (err: any) {
      setError("Erro ao fazer login. Tente novamente.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await signUp(
        signupEmail,
        signupPassword,
        signupFullName
      );

      if (error) {
        if (
          error.message.includes("already registered") ||
          error.message.includes("User already registered")
        ) {
          setError(
            "Este email já está registado. Por favor, faça login ou recupere a senha."
          );
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(
          "Conta criada com sucesso! Verifique seu email para confirmar a conta."
        );
        setSignupEmail("");
        setSignupPassword("");
        setSignupFullName("");
      }
    } catch (err: any) {
      setError("Erro ao criar conta. Tente novamente.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResettingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) {
        setError("Erro ao enviar email de recuperação: " + error.message);
      } else {
        setSuccess(
          "Email de recuperação enviado! Verifique sua caixa de entrada."
        );
        setResetEmail("");
        setShowResetForm(false);
      }
    } catch (err: any) {
      setError("Erro ao enviar email de recuperação. Tente novamente.");
      console.error("Reset password error:", err);
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Área Administrativa
          </h1>
          <p className="text-gray-600 mt-2">
            Faça login para acessar o painel administrativo
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </TabsContent>

              <TabsContent value="signup">
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Crie uma nova conta de administrador
                </CardDescription>
              </TabsContent>
            </Tabs>
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

            {showResetForm ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium">Recuperar Senha</h3>
                  <p className="text-sm text-gray-600">
                    Digite seu email para receber o link de recuperação
                  </p>
                </div>

                <div>
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={isResettingPassword}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetForm(false)}
                    className="flex-1"
                    disabled={isResettingPassword}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Email"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => setShowResetForm(true)}
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowSignupPassword(!showSignupPassword)
                          }
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar ao site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
