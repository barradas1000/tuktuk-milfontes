
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Info
} from 'lucide-react';
import { useAdminReservations } from '@/hooks/useAdminReservations';
import AdminCalendar from './AdminCalendar';
import AdminReservationsList from './AdminReservationsList';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
  console.log('AdminDashboard component rendering...');
  
  const { t } = useTranslation();
  const { getStatistics, reservationsLoading, error, isSupabaseConfigured } = useAdminReservations();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  console.log('AdminDashboard state:', { reservationsLoading, error, selectedDate, isSupabaseConfigured });

  const stats = getStatistics();
  console.log('Dashboard stats:', stats);

  if (error) {
    console.error('Error in AdminDashboard:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (reservationsLoading) {
    console.log('Showing loading state...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main dashboard...');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛺 Painel Administrativo - TukTuk Milfontes
          </h1>
          <p className="text-gray-600">
            Gerir reservas, disponibilidades e horários em tempo real
          </p>
          
          {/* Supabase Status */}
          {!isSupabaseConfigured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Info className="h-5 w-5" />
                <span className="font-medium">Modo Demonstração</span>
              </div>
              <p className="text-yellow-700 mt-1 text-sm">
                A base de dados Supabase não está configurada. A usar dados de exemplo para demonstração.
                Para funcionalidade completa, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
              </p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalReservations}</div>
                <p className="text-xs text-gray-600">Este mês: {stats.monthlyReservations}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingReservations}</div>
                <p className="text-xs text-gray-600">Aguardam confirmação</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmedReservations}</div>
                <p className="text-xs text-gray-600">Hoje: {stats.todayReservations}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita</CardTitle>
                <Euro className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">€{stats.totalRevenue}</div>
                <p className="text-xs text-gray-600">Reservas confirmadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Show message if no stats available */}
        {!stats && (
          <Card className="mb-8">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhuma reserva encontrada
                </h3>
                <p className="text-gray-500">
                  Ainda não há reservas no sistema. As estatísticas aparecerão quando houver dados.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <AdminCalendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
            />
          </TabsContent>

          <TabsContent value="reservations">
            <AdminReservationsList />
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
