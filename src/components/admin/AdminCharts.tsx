import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface AdminChartsProps {
  dailyStats: Array<{ date: string; reservations: number; revenue: number }>;
  monthlyStats: Array<{ month: string; reservations: number; revenue: number }>;
  topTourTypes: Array<{ type: string; count: number; revenue: number }>;
}

const AdminCharts: React.FC<AdminChartsProps> = ({
  dailyStats,
  monthlyStats,
  topTourTypes,
}) => {
  const maxReservations = Math.max(...dailyStats.map((d) => d.reservations), 1);
  const maxRevenue = Math.max(...dailyStats.map((d) => d.revenue), 1);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous)
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Gráfico de Reservas Diárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Reservas Diárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {dailyStats.map((day, index) => {
              const height = (day.reservations / maxReservations) * 100;
              const previousDay =
                index > 0 ? dailyStats[index - 1].reservations : 0;

              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center flex-1"
                >
                  <div className="text-xs text-gray-600 mb-1">
                    {day.reservations}
                  </div>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.reservations} reservas`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">{day.date}</div>
                  <div className="mt-1">
                    {getTrendIcon(day.reservations, previousDay)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Receita Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Receita Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyStats.map((month, index) => {
              const height = (month.revenue / maxRevenue) * 100;
              const previousMonth =
                index > 0 ? monthlyStats[index - 1].revenue : 0;

              return (
                <div
                  key={month.month}
                  className="flex flex-col items-center flex-1"
                >
                  <div className="text-xs text-gray-600 mb-1">
                    €{month.revenue.toFixed(0)}
                  </div>
                  <div
                    className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${month.month}: €${month.revenue.toFixed(2)}`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {month.month}
                  </div>
                  <div className="mt-1">
                    {getTrendIcon(month.revenue, previousMonth)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Top Tours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição por Tipo de Tour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Por Número de Reservas</h4>
              <div className="space-y-3">
                {topTourTypes.map((tour, index) => {
                  const totalCount = topTourTypes.reduce(
                    (sum, t) => sum + t.count,
                    0
                  );
                  const percentage =
                    totalCount > 0 ? (tour.count / totalCount) * 100 : 0;
                  const colors = [
                    "#3B82F6",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                  ];

                  return (
                    <div key={tour.type} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">
                            {tour.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {tour.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors[index % colors.length],
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Por Receita</h4>
              <div className="space-y-3">
                {topTourTypes.map((tour, index) => {
                  const totalRevenue = topTourTypes.reduce(
                    (sum, t) => sum + t.revenue,
                    0
                  );
                  const percentage =
                    totalRevenue > 0 ? (tour.revenue / totalRevenue) * 100 : 0;
                  const colors = [
                    "#3B82F6",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                  ];

                  return (
                    <div key={tour.type} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">
                            {tour.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            €{tour.revenue.toFixed(0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors[index % colors.length],
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Taxa de Confirmação */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.85)}`}
                    className="text-green-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">85%</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold">Taxa de Confirmação</div>
                <div className="text-sm text-gray-600">
                  Reservas confirmadas
                </div>
              </div>
            </div>

            {/* Taxa de Conclusão */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.78)}`}
                    className="text-blue-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">78%</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold">Taxa de Conclusão</div>
                <div className="text-sm text-gray-600">Tours realizados</div>
              </div>
            </div>

            {/* Satisfação do Cliente */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.92)}`}
                    className="text-yellow-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">92%</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold">Satisfação</div>
                <div className="text-sm text-gray-600">
                  Clientes satisfeitos
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
