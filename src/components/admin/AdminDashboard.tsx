import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Clock, Calendar, Users, TrendingUp, XCircle, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCalendar from "./AdminCalendar";
import AdminReservationsList from "./AdminReservationsList";
import AdminReports from "./AdminReports";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import { useActiveConductors } from "@/hooks/useActiveConductors";

// --- DeepLinkPopup Component ---
const DeepLinkPopup = ({
  onClose,
  onActivateGps,
  conductorId,
  conductorName,
}: {
  onClose: () => void;
  onActivateGps: () => void;
  conductorId: string | null;
  conductorName: string | null;
}) => {
  const deepLink = useMemo(() => {
    if (!conductorId) return "tuktukgps://";
    return conductorName
      ? `tuktukgps://tracking?cid=${conductorId}&name=${encodeURIComponent(conductorName)}`
      : `tuktukgps://tracking?cid=${conductorId}`;
  }, [conductorId, conductorName]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center shadow-lg">
        <h2 className="text-lg font-semibold mb-3">🚦 Ativação GPS TukTuk-Milfontes</h2>
        <p className="text-sm text-gray-700 mb-4">
          Para enviar sua localização em tempo real, abra o app GPS do condutor.
        </p>
        <a
          href={deepLink}
          onClick={onActivateGps}
          className="inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded mb-3 hover:bg-blue-700"
        >
          Abrir App GPS
        </a>
        {conductorId && (
          <p className="text-xs text-blue-700 mb-2">
            Condutor: {conductorName || "Desconhecido"} (ID: {conductorId})
          </p>
        )}
        <button
          onClick={onClose}
          className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

// --- Clock Component ---
const DashboardClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm font-mono bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
      <span className="text-blue-800 font-semibold">
        {format(currentTime, "dd/MM/yyyy HH:mm:ss", { locale: pt })}
      </span>
    </div>
  );
};

// --- AdminDashboard Component ---
const AdminDashboard = () => {
  const { t } = useTranslation();
  const { getStatistics, isLoading, error, isSupabaseConfigured } = useAdminReservations();
  const { conductors } = useActiveConductors();
  const activeConductors = conductors.filter(c => c.is_active);

  const [showPopup, setShowPopup] = useState(false);
  const [gpsActivated, setGpsActivated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const stats = getStatistics();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              🛺 Painel Administrativo - TukTuk Milfontes
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gerir reservas, disponibilidades e horários em tempo real
            </p>
          </div>
          <DashboardClock />
        </div>

        {/* Supabase warning */}
        {!isSupabaseConfigured && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
            <Info className="h-5 w-5" />
            <span className="font-medium">Modo Demonstração</span>
            <p className="text-yellow-700 text-xs sm:text-sm mt-1">
              Base de dados Supabase não configurada. Usando dados de demonstração.
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="reservations" className="space-y-4 sm:space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Reservas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Disponibilidade
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <AdminReservationsList />
          </TabsContent>

          <TabsContent value="calendar">
            <AdminCalendar />
            {activeConductors.length > 0 && !gpsActivated && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setShowPopup(true)}
                  className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg animate-pulse"
                >
                  🚦 Ativar Rastreamento GPS
                </Button>
              </div>
            )}
            {showPopup && (
              <DeepLinkPopup
                conductorId={activeConductors[0]?.conductor_id || null}
                conductorName={activeConductors[0]?.name || null}
                onClose={() => setShowPopup(false)}
                onActivateGps={() => {
                  setShowPopup(false);
                  setGpsActivated(true);
                }}
              />
            )}
            {gpsActivated && (
              <div className="mt-4 px-4 py-2 bg-green-100 border border-green-300 rounded text-green-800 flex items-center gap-2 animate-pulse">
                Localização em tempo real ativa
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AdminReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
