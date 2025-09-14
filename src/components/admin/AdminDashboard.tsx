import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
// import { useTranslation } from "react-i18next";
import {
  Clock,
  Calendar,
  Users,
  TrendingUp,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Importar os componentes das sub-abas diretamente
import ReservationsTab from "./AdminCalendar/ReservationsTab";
import AvailabilityTab from "./AdminCalendar/AvailabilityTab";
import ActiveConductorsPanel from "./AdminCalendar/ActiveConductorsPanel";
import { getTourDisplayName } from "./AdminCalendar/helpers";
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
      ? `tuktukgps://tracking?cid=${conductorId}&name=${encodeURIComponent(
          conductorName
        )}`
      : `tuktukgps://tracking?cid=${conductorId}`;
  }, [conductorId, conductorName]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center shadow-lg">
        <h2 className="text-lg font-semibold mb-3">
          🚦 Ativação GPS TukTuk-Milfontes
        </h2>
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
  // const { t } = useTranslation(); // Temporariamente removido pois não está sendo usado
  const { getStatistics, isLoading, error, isSupabaseConfigured } =
    useAdminReservations();
  const { conductors } = useActiveConductors();
  const activeConductors = conductors.filter((c) => c.is_active);

  const [showPopup, setShowPopup] = useState(false);
  const [gpsActivated, setGpsActivated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const stats = getStatistics();

  // Handler para o botão GPS dentro do AvailabilityTab
  const handleGPSButtonClick = () => {
    setShowPopup(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
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
    <div className="min-h-screen bg-gray-50 p-4 overflow-x-scroll-custom">
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
              Base de dados Supabase não configurada. Usando dados de
              demonstração.
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="reservations" className="space-y-4 sm:space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger
              value="reservations"
              className="flex items-center gap-2"
            >
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📅 Gestão de Reservas
              </h2>
              <div className="space-y-6">
                <AdminReservationsList />

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    📅 Calendário de Reservas por Data
                  </h3>
                  <ReservationsTab
                    selectedDate={new Date()}
                    getTourDisplayName={getTourDisplayName}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            {/* Condutores Ativos */}
            {conductors.length > 0 ? (
              <ActiveConductorsPanel conductors={conductors} />
            ) : (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col gap-3 items-center shadow-md">
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                  Condutores Ativos
                </h2>
                <div className="text-center py-4 text-purple-700">
                  <p>Carregando condutores...</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Se esta mensagem persistir, verifique a configuração do
                    Supabase.
                  </p>
                </div>
              </div>
            )}

            {/* Gestão de Disponibilidade do TukTuk */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚦 Gestão de Disponibilidade do TukTuk
              </h2>
              <AvailabilityTab
                selectedDate={new Date()}
                showGPSButton={!gpsActivated}
                onGPSButtonClick={handleGPSButtonClick}
              />
            </div>
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
