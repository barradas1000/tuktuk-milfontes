import React, { useState } from "react";
import { useActiveConductors } from "@/hooks/useActiveConductors";
// Componente popup de ativação do GPS via deep link
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
  // Gerar token de sessão simples (timestamp + random string)
  const generateSessionToken = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${randomStr}`;
  };

  const sessionToken = generateSessionToken();
  
  const deepLink = conductorId && conductorName
    ? `tuktukgps://tracking?cid=${conductorId}&name=${encodeURIComponent(conductorName)}&token=${sessionToken}&timestamp=${Date.now()}`
    : conductorId
    ? `tuktukgps://tracking?cid=${conductorId}&token=${sessionToken}&timestamp=${Date.now()}`
    : 'tuktukgps://';

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          maxWidth: 340,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>🚦 Ativação GPS TukTuk-Milfontes</h2>
        <p style={{ marginBottom: 18 }}>
          Para enviar sua localização em tempo real, abra o app GPS do condutor.
        </p>
        <a
          href={deepLink}
          style={{
            display: "inline-block",
            background: "#00796b",
            color: "#fff",
            fontWeight: "bold",
            padding: "12px 24px",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: "1.1em",
            marginBottom: 12,
          }}
          onClick={onActivateGps}
        >
          Abrir App GPS
        </a>
        {conductorId && (
          <div style={{ fontSize: "0.85em", color: "#00796b", marginBottom: 8 }}>
            <p>Condutor ID: {conductorId}</p>
            {conductorName && <p>Nome: {conductorName}</p>}
            <p style={{ fontSize: "0.75em", color: "#666", marginTop: 4 }}>
              Token de sessão: {sessionToken.substring(0, 12)}...
            </p>
          </div>
        )}
        <p style={{ fontSize: "0.95em", color: "#555" }}>
          Se não tiver o app, clique para instalar ou peça suporte.
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            background: "#eee",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Euro,
  Phone,
  Mail,
  Database,
  Info,
} from "lucide-react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import AdminCalendar from "./AdminCalendar";
import AdminReservationsList from "./AdminReservationsList";
import AdminReports from "./AdminReports";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const AdminDashboard = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [gpsActivated, setGpsActivated] = useState(false);
  const { t } = useTranslation();
  const { getStatistics, reservationsLoading, error, isSupabaseConfigured } =
    useAdminReservations();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio a cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Função para formatar a data e hora atual
  const formatCurrentDateTime = () => {
    return format(currentTime, "dd/MM/yyyy HH:mm:ss", { locale: pt });
  };

  const stats = getStatistics();

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

  if (reservationsLoading) {
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 relative">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                🛺 Painel Administrativo - TukTuk Milfontes
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Gerir reservas, disponibilidades e horários em tempo real
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Relógio responsivo */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono bg-blue-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-blue-200 shadow-sm w-full sm:w-auto justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">
                  {formatCurrentDateTime()}
                </span>
              </div>
            </div>
          </div>

          {/* Supabase Status */}
          {!isSupabaseConfigured && (
            <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Info className="h-5 w-5" />
                <span className="font-medium">Modo Demonstração</span>
              </div>
              <p className="text-yellow-700 mt-1 text-xs sm:text-sm">
                A base de dados Supabase não está configurada. A usar dados de
                exemplo para demonstração. Para funcionalidade completa,
                configure as variáveis de ambiente VITE_SUPABASE_URL e
                VITE_SUPABASE_ANON_KEY.
              </p>
            </div>
          )}
        </div>

        {/* Menu de navegação - TabsList */}
        <Tabs defaultValue="reservations" className="space-y-4 sm:space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger
              value="reservations"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Disponibilidade
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das abas e dashboard */}
          <div>
            {/* Statistics Cards - ocultos na aba Disponibilidade */}
            <TabsContent value="reservations" className="mt-0">
              {/* ...existing code... */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* ...existing code... */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Reservas
                      </CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalReservations}
                      </div>
                      <p className="text-xs text-gray-600">
                        Este mês: {stats.monthlyReservations}
                      </p>
                    </CardContent>
                  </Card>
                  {/* ...existing code... */}
                </div>
              )}
              {/* ...existing code... */}
              {!stats && (
                <Card className="mb-8">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Nenhuma reserva encontrada
                      </h3>
                      <p className="text-gray-500">
                        Ainda não há reservas no sistema. As estatísticas
                        aparecerão quando houver dados.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* ...existing code... */}
              <AdminReservationsList />
            </TabsContent>
            {/* ...existing code... */}
            <TabsContent value="analytics" className="mt-0">
              {/* Botão para acessar histórico */}
              <div className="mb-6 flex justify-end">
                <Button 
                  onClick={() => window.open('http://localhost:8081/admin/historico', '_blank')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Ver Histórico de Viagens
                </Button>
              </div>
              
              {/* ...existing code... */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* ...existing code... */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Reservas
                      </CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalReservations}
                      </div>
                      <p className="text-xs text-gray-600">
                        Este mês: {stats.monthlyReservations}
                      </p>
                    </CardContent>
                  </Card>
                  {/* ...existing code... */}
                </div>
              )}
              {/* ...existing code... */}
              <AdminReports />
            </TabsContent>
            {/* ...existing code... */}
            <TabsContent value="calendar" className="mt-0">
              <style>{`
                @keyframes pulseScale {
                  0% { transform: scale(1); background: #2196f3; }
                  50% { transform: scale(1.18); background: #00bfff; }
                  100% { transform: scale(1); background: #2196f3; }
                }
              `}</style>
              {/* Renderização do AdminCalendar, mas o botão de ativação do GPS será exibido logo após o bloco de condutores ativos e WhatsApp responsável */}
              <AdminCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                renderAfterActiveBlock={({ activeConductors, activeConductorsWithNames }) => (
                  <>
                    {activeConductors &&
                      activeConductors.length > 0 &&
                      !gpsActivated && (
                        <div className="mb-6 flex justify-end">
                          <button
                            onClick={() => setShowPopup(true)}
                            style={{
                              background: "#2196f3",
                              color: "#fff",
                              fontWeight: "bold",
                              padding: "12px 28px",
                              borderRadius: 10,
                              fontSize: "1.08em",
                              boxShadow: "0 0 16px #00bfff88",
                              animation: "pulseScale 1.2s infinite",
                              border: "2px solid #00bfff",
                              transition: "transform 0.2s, background 0.2s",
                            }}
                          >
                            🚦 Ativar Rastreamento GPS
                          </button>
                        </div>
                      )}
                    {showPopup && (
                      <DeepLinkPopup
                        onClose={() => setShowPopup(false)}
                        onActivateGps={() => {
                          setShowPopup(false);
                          setGpsActivated(true);
                        }}
                        conductorId={activeConductors.length > 0 ? activeConductors[0] : null}
                        conductorName={activeConductorsWithNames.length > 0 ? activeConductorsWithNames[0].name : null}
                      />
                    )}
                    {gpsActivated && (
                      <div className="mt-4 px-4 py-2 bg-green-100 border border-green-300 rounded text-green-800 flex items-center gap-2 animate-pulse">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0-4H8m4 0h4"
                          />
                        </svg>
                        <span>
                          Localização em tempo real ativa: o seu dispositivo
                          está a enviar a posição para o sistema.
                        </span>
                      </div>
                    )}
                  </>
                )}
              />
            </TabsContent>
            <TabsContent value="analytics">
              <AdminReports />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
