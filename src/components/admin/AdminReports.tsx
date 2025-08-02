import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Euro,
  Clock,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { pt } from "date-fns/locale";
import { AdminReservation } from "@/types/adminReservations";
import { useToast } from "@/components/ui/use-toast";
import AdminCharts from "./AdminCharts";

interface ReportData {
  totalReservations: number;
  totalRevenue: number;
  averageRevenue: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  topTourTypes: Array<{ type: string; count: number; revenue: number }>;
  dailyStats: Array<{ date: string; reservations: number; revenue: number }>;
  monthlyStats: Array<{ month: string; reservations: number; revenue: number }>;
  customerStats: {
    totalCustomers: number;
    repeatCustomers: number;
    averageGroupSize: number;
  };
  performanceMetrics: {
    confirmationRate: number;
    completionRate: number;
    cancellationRate: number;
    averageResponseTime: number;
  };
}

const AdminReports = () => {
  const { reservations } = useAdminReservations();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Calcular dados do relatório
  const reportData = useMemo((): ReportData => {
    if (!reservations || reservations.length === 0) {
      return {
        totalReservations: 0,
        totalRevenue: 0,
        averageRevenue: 0,
        confirmedReservations: 0,
        pendingReservations: 0,
        cancelledReservations: 0,
        completedReservations: 0,
        topTourTypes: [],
        dailyStats: [],
        monthlyStats: [],
        customerStats: {
          totalCustomers: 0,
          repeatCustomers: 0,
          averageGroupSize: 0,
        },
        performanceMetrics: {
          confirmationRate: 0,
          completionRate: 0,
          cancellationRate: 0,
          averageResponseTime: 0,
        },
      };
    }

    const daysAgo = parseInt(dateRange);
    const startDate = subDays(new Date(), daysAgo);

    const filteredReservations = reservations.filter(
      (reservation) => new Date(reservation.reservation_date) >= startDate
    );

    // Estatísticas básicas
    const totalReservations = filteredReservations.length;
    const totalRevenue = filteredReservations
      .filter((r) => r.status === "confirmed" || r.status === "completed")
      .reduce(
        (sum, r) =>
          sum +
          (typeof r.manual_payment === "number"
            ? r.manual_payment
            : r.total_price || 0),
        0
      );

    const averageRevenue =
      totalReservations > 0 ? totalRevenue / totalReservations : 0;

    // Contagem por status
    const statusCounts = filteredReservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top tipos de tour
    const tourTypeStats = filteredReservations.reduce((acc, r) => {
      if (!acc[r.tour_type]) {
        acc[r.tour_type] = { count: 0, revenue: 0 };
      }
      acc[r.tour_type].count++;
      if (r.status === "confirmed" || r.status === "completed") {
        acc[r.tour_type].revenue +=
          typeof r.manual_payment === "number"
            ? r.manual_payment
            : r.total_price || 0;
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topTourTypes = Object.entries(tourTypeStats)
      .map(([type, stats]) => ({ type, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estatísticas diárias
    const dailyStats = eachDayOfInterval({
      start: startDate,
      end: new Date(),
    }).map((date) => {
      const dayReservations = filteredReservations.filter(
        (r) => r.reservation_date === format(date, "yyyy-MM-dd")
      );
      const dayRevenue = dayReservations
        .filter((r) => r.status === "confirmed" || r.status === "completed")
        .reduce(
          (sum, r) =>
            sum +
            (typeof r.manual_payment === "number"
              ? r.manual_payment
              : r.total_price || 0),
          0
        );

      return {
        date: format(date, "dd/MM"),
        reservations: dayReservations.length,
        revenue: dayRevenue,
      };
    });

    // Estatísticas mensais
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(monthStart);
      const monthReservations = filteredReservations.filter((r) => {
        const reservationDate = new Date(r.reservation_date);
        return reservationDate >= monthStart && reservationDate <= monthEnd;
      });
      const monthRevenue = monthReservations
        .filter((r) => r.status === "confirmed" || r.status === "completed")
        .reduce(
          (sum, r) =>
            sum +
            (typeof r.manual_payment === "number"
              ? r.manual_payment
              : r.total_price || 0),
          0
        );

      return {
        month: format(monthStart, "MMM yyyy", { locale: pt }),
        reservations: monthReservations.length,
        revenue: monthRevenue,
      };
    }).reverse();

    // Estatísticas de clientes
    const uniqueCustomers = new Set(
      filteredReservations.map((r) => r.customer_email)
    );
    const customerReservations = filteredReservations.reduce((acc, r) => {
      if (!acc[r.customer_email]) {
        acc[r.customer_email] = [];
      }
      acc[r.customer_email].push(r);
      return acc;
    }, {} as Record<string, AdminReservation[]>);

    const repeatCustomers = Object.values(customerReservations).filter(
      (reservations) => reservations.length > 1
    ).length;
    const averageGroupSize =
      filteredReservations.reduce(
        (sum, r) => sum + (r.number_of_people || 0),
        0
      ) / totalReservations;

    // Métricas de performance
    const confirmationRate =
      totalReservations > 0
        ? ((statusCounts.confirmed || 0) / totalReservations) * 100
        : 0;
    const completionRate =
      totalReservations > 0
        ? ((statusCounts.completed || 0) / totalReservations) * 100
        : 0;
    const cancellationRate =
      totalReservations > 0
        ? ((statusCounts.cancelled || 0) / totalReservations) * 100
        : 0;

    return {
      totalReservations,
      totalRevenue,
      averageRevenue,
      confirmedReservations: statusCounts.confirmed || 0,
      pendingReservations: statusCounts.pending || 0,
      cancelledReservations: statusCounts.cancelled || 0,
      completedReservations: statusCounts.completed || 0,
      topTourTypes,
      dailyStats,
      monthlyStats,
      customerStats: {
        totalCustomers: uniqueCustomers.size,
        repeatCustomers,
        averageGroupSize: Math.round(averageGroupSize * 10) / 10,
      },
      performanceMetrics: {
        confirmationRate: Math.round(confirmationRate * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        averageResponseTime: 2.5, // Placeholder - seria calculado baseado em timestamps reais
      },
    };
  }, [reservations, dateRange]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const exportToCSV = () => {
    if (!reservations || reservations.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há reservas no período selecionado",
        variant: "destructive",
      });
      return;
    }

    // Cabeçalhos em português
    const headers = [
      "ID da Reserva",
      "Nome do Cliente",
      "Email",
      "Telefone",
      "Data da Reserva",
      "Hora da Reserva",
      "Tipo de Tour",
      "Número de Pessoas",
      "Status",
      "Valor Original (€)",
      "Pagamento Manual (€)",
      "Receita Total (€)",
      "Pedidos Especiais",
      "Idioma",
      "Data de Criação",
    ];

    // Função para traduzir status
    const translateStatus = (status: string) => {
      const statusMap: Record<string, string> = {
        pending: "Pendente",
        confirmed: "Confirmada",
        cancelled: "Cancelada",
        completed: "Concluída",
      };
      return statusMap[status] || status;
    };

    // Função para traduzir tipo de tour
    const translateTourType = (tourType: string) => {
      const tourMap: Record<string, string> = {
        panoramic: "Passeio panorâmico pela vila",
        furnas: "Vila Nova de Milfontes → Praia das Furnas",
        bridge: "Travessia da ponte",
        sunset: "Pôr do Sol Romântico",
        night: "Passeio noturno",
        fishermen: "Rota dos Pescadores",
      };
      return tourMap[tourType] || tourType;
    };

    // Função para formatar data
    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: pt });
      } catch {
        return dateString;
      }
    };

    // Função para formatar data e hora de criação
    const formatCreatedAt = (dateString: string) => {
      try {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: pt });
      } catch {
        return dateString;
      }
    };

    // Dados formatados
    const csvData = reservations.map((r) => [
      r.id,
      r.customer_name,
      r.customer_email,
      r.customer_phone,
      formatDate(r.reservation_date),
      r.reservation_time,
      translateTourType(r.tour_type),
      r.number_of_people,
      translateStatus(r.status),
      (r.total_price || 0).toFixed(2),
      (r.manual_payment || 0).toFixed(2),
      (typeof r.manual_payment === "number"
        ? r.manual_payment
        : r.total_price || 0
      ).toFixed(2),
      r.special_requests || "",
      r.language || "pt",
      formatCreatedAt(r.created_at),
    ]);

    // Criar conteúdo CSV com encoding UTF-8 BOM para caracteres especiais
    const csvContent = [headers, ...csvData]
      .map((row) =>
        row
          .map((cell) => {
            // Escapar aspas duplas e quebras de linha
            const escapedCell = String(cell)
              .replace(/"/g, '""')
              .replace(/\n/g, " ");
            return `"${escapedCell}"`;
          })
          .join(";")
      ) // Usar ponto e vírgula como separador (padrão europeu)
      .join("\n");

    // Adicionar BOM para UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Nome do arquivo com data e hora
    const fileName = `relatorio_reservas_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm"
    )}.csv`;
    link.setAttribute("download", fileName);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório exportado com sucesso",
      description: `Arquivo "${fileName}" foi descarregado`,
    });
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous)
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatórios e Análises
            </div>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Período:</span>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Tipo:</span>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Visão Geral</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reservas
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reportData.totalReservations}
            </div>
            <p className="text-xs text-gray-600">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{reportData.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600">
              Média: €{reportData.averageRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa Confirmação
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reportData.performanceMetrics.confirmationRate}%
            </div>
            <p className="text-xs text-gray-600">Reservas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Únicos
            </CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reportData.customerStats.totalCustomers}
            </div>
            <p className="text-xs text-gray-600">
              {reportData.customerStats.repeatCustomers} repetem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Visuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráficos e Visualizações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCharts
            dailyStats={reportData.dailyStats}
            monthlyStats={reportData.monthlyStats}
            topTourTypes={reportData.topTourTypes}
          />
        </CardContent>
      </Card>

      {/* Seções expansíveis */}
      <div className="space-y-4">
        {/* Status das Reservas */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection("status")}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Status das Reservas
              </div>
              {expandedSections.includes("status") ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.includes("status") && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    status: "pending",
                    label: "Pendentes",
                    count: reportData.pendingReservations,
                  },
                  {
                    status: "confirmed",
                    label: "Confirmadas",
                    count: reportData.confirmedReservations,
                  },
                  {
                    status: "completed",
                    label: "Concluídas",
                    count: reportData.completedReservations,
                  },
                  {
                    status: "cancelled",
                    label: "Canceladas",
                    count: reportData.cancelledReservations,
                  },
                ].map(({ status, label, count }) => (
                  <div key={status} className="text-center">
                    <Badge className={`${getStatusColor(status)} mb-2`}>
                      {label}
                    </Badge>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">
                      {reportData.totalReservations > 0
                        ? (
                            (count / reportData.totalReservations) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Top Tours */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection("tours")}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Tours Mais Populares
              </div>
              {expandedSections.includes("tours") ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.includes("tours") && (
            <CardContent>
              <div className="space-y-4">
                {reportData.topTourTypes.map((tour, index) => (
                  <div
                    key={tour.type}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{tour.type}</div>
                        <div className="text-sm text-gray-600">
                          {tour.count} reservas
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        €{tour.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Receita</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Estatísticas Mensais */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection("monthly")}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Tendência Mensal
              </div>
              {expandedSections.includes("monthly") ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.includes("monthly") && (
            <CardContent>
              <div className="space-y-3">
                {reportData.monthlyStats.map((month, index) => (
                  <div
                    key={month.month}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="font-medium">{month.month}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{month.reservations}</div>
                        <div className="text-sm text-gray-600">Reservas</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          €{month.revenue.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Receita</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection("performance")}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Métricas de Performance
              </div>
              {expandedSections.includes("performance") ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.includes("performance") && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Taxas de Conversão</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Confirmação</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${reportData.performanceMetrics.confirmationRate}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-medium">
                          {reportData.performanceMetrics.confirmationRate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conclusão</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${reportData.performanceMetrics.completionRate}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-medium">
                          {reportData.performanceMetrics.completionRate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cancelamento</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${reportData.performanceMetrics.cancellationRate}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-medium">
                          {reportData.performanceMetrics.cancellationRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Estatísticas de Clientes</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Clientes</span>
                      <span className="font-medium">
                        {reportData.customerStats.totalCustomers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clientes Recorrentes</span>
                      <span className="font-medium">
                        {reportData.customerStats.repeatCustomers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamanho Médio do Grupo</span>
                      <span className="font-medium">
                        {reportData.customerStats.averageGroupSize} pessoas
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Médio de Resposta</span>
                      <span className="font-medium">
                        {reportData.performanceMetrics.averageResponseTime}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        {/* Resumo Executivo */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection("summary")}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo Executivo e Insights
              </div>
              {expandedSections.includes("summary") ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.includes("summary") && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Principais Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">
                        Performance Geral
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        {reportData.totalReservations > 0
                          ? `Média de ${(
                              reportData.totalReservations / parseInt(dateRange)
                            ).toFixed(1)} reservas por dia`
                          : "Sem reservas no período"}
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Receita</div>
                      <div className="text-sm text-green-600 mt-1">
                        Receita média de €{reportData.averageRevenue.toFixed(2)}{" "}
                        por reserva
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">
                        Clientes
                      </div>
                      <div className="text-sm text-purple-600 mt-1">
                        {reportData.customerStats.repeatCustomers > 0
                          ? `${(
                              (reportData.customerStats.repeatCustomers /
                                reportData.customerStats.totalCustomers) *
                              100
                            ).toFixed(1)}% de clientes recorrentes`
                          : "Todos os clientes são novos"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Recomendações</h4>
                  <div className="space-y-3">
                    {reportData.performanceMetrics.confirmationRate < 80 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="font-medium text-yellow-800">
                          Melhorar Confirmações
                        </div>
                        <div className="text-sm text-yellow-600 mt-1">
                          Taxa de confirmação baixa. Considere melhorar o
                          processo de follow-up.
                        </div>
                      </div>
                    )}

                    {reportData.performanceMetrics.cancellationRate > 20 && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="font-medium text-red-800">
                          Reduzir Cancelamentos
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          Taxa de cancelamento alta. Revise políticas de
                          cancelamento.
                        </div>
                      </div>
                    )}

                    {reportData.customerStats.averageGroupSize < 2 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800">
                          Promover Grupos
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          Grupos pequenos. Considere descontos para grupos
                          maiores.
                        </div>
                      </div>
                    )}

                    {reportData.topTourTypes.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">
                          Tour Mais Popular
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          "{reportData.topTourTypes[0].type}" é o mais
                          solicitado. Considere expandir disponibilidade.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KPIs Principais */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold mb-3">KPIs Principais</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.totalReservations}
                    </div>
                    <div className="text-sm text-gray-600">Total Reservas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      €{reportData.totalRevenue.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Receita Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {reportData.performanceMetrics.confirmationRate}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Taxa Confirmação
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {reportData.customerStats.totalCustomers}
                    </div>
                    <div className="text-sm text-gray-600">Clientes Únicos</div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
