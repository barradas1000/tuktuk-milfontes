import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../lib/supabase";
import PassengerMap from "../components/PassengerMap";
import ToggleTrackingButton from "../components/ToggleTrackingButton";
// Componente de teste removido

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  type MinimalUser = { id: string; email: string | null } | null;
  const [user, setUser] = useState<MinimalUser>(null);
  const [conductorId, setConductorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o utilizador está autenticado
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser({ id: user.id, email: user.email ?? null });

      // Buscar ou criar registo do condutor (tabela 'conductors')
      try {
        const { data: existingConductor, error: fetchError } = await supabase
          .from("conductors")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Erro ao obter condutor:", fetchError);
        }

        if (!existingConductor) {
          // Condutor não existe, criar novo registo
          const { data: newConductor, error: insertError } = await supabase
            .from("conductors")
            .insert({
              id: user.id,
              name: user.email ? user.email.split("@")[0] : "Condutor",
              is_active: false,
              latitude: 37.725,
              longitude: -8.783,
            })
            .select()
            .single();

          if (insertError) {
            console.error("Erro ao criar condutor:", insertError);
            return;
          }

          setConductorId(newConductor.id);
        } else {
          setConductorId(existingConductor.id);
        }
      } catch (error) {
        console.error("Erro ao verificar condutor:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard do Condutor
              </h1>
              <p className="text-sm text-gray-600">Bem-vindo, {user?.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Terminar Sessão
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🗺️ Mapa em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PassengerMap />
              </CardContent>
            </Card>
          </div>

          {/* Controlo de Rastreamento */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎛️ Controlo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conductorId ? (
                  <ToggleTrackingButton conductorId={conductorId} />
                ) : (
                  <div className="text-center text-gray-500">
                    Carregando controlos...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">ℹ️ Instruções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>LIGAR:</strong> Ativa o rastreamento e torna o TukTuk
                  visível no mapa.
                </div>
                <div>
                  <strong>DESLIGAR:</strong> Para o rastreamento e oculta o
                  TukTuk do mapa.
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  💡 Dica: Mantenha o navegador aberto para continuar a enviar a
                  localização.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Componente de teste removido */}
    </div>
  );
};

export default DriverDashboard;
