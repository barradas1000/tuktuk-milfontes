"use client";

import { useState, useEffect } from "react";
import { HistoryFilters } from "@/components/admin/history/HistoryFilters";
import { TripSummary } from "@/components/admin/history/TripSummary";
import { RouteMap } from "@/components/admin/history/RouteMap";
import { StatusAuditList } from "@/components/admin/history/StatusAuditList";
import { ActivityLogList } from "@/components/admin/history/ActivityLogList";
import { historyService } from "@/services/historyService";
import {
  Conductor,
  LocationPoint,
  StatusAudit,
  ActivityLog,
  ExpandedHistoryFilters,
} from "@/types/history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface ExpandedHistoryData {
  locations: LocationPoint[];
  statusAudits: StatusAudit[];
  activityLogs: ActivityLog[];
}

export default function HistoryPage() {
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<ExpandedHistoryData>({
    locations: [],
    statusAudits: [],
    activityLogs: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar condutores na inicialização
  useEffect(() => {
    const loadConductors = async () => {
      try {
        const data = await historyService.fetchConductors();
        setConductors(data);
      } catch (err) {
        setError("Erro ao carregar condutores");
        console.error("Error loading conductors:", err);
      }
    };

    loadConductors();
  }, []);

  // Handler para gerar relatório
  const handleGenerateReport = async (filters: ExpandedHistoryFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await historyService.fetchExpandedHistory(filters);
      setExpandedHistory(data);
    } catch (err) {
      setError("Erro ao carregar histórico");
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Viagens</h1>
        <p className="text-muted-foreground">
          Consulte o histórico de localizações e estatísticas das viagens
        </p>
      </div>

      {/* Filtros */}
      <HistoryFilters
        conductors={conductors}
        onGenerateReport={handleGenerateReport}
        isLoading={isLoading}
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Carregando dados...</span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conteúdo */}
      {!isLoading &&
        (expandedHistory.locations.length > 0 ||
          expandedHistory.statusAudits.length > 0 ||
          expandedHistory.activityLogs.length > 0) && (
          <div className="space-y-6">
            {/* Estatísticas e Mapa - apenas se houver localizações */}
            {expandedHistory.locations.length > 0 && (
              <>
                <TripSummary points={expandedHistory.locations} />

                <Card>
                  <CardHeader>
                    <CardTitle>Rota Percorrida</CardTitle>
                    <CardDescription>
                      Visualização do trajeto realizado pelo condutor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RouteMap points={expandedHistory.locations} />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Histórico de Status - se houver dados */}
            {expandedHistory.statusAudits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Status</CardTitle>
                  <CardDescription>
                    Alterações no status do condutor durante o período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusAuditList audits={expandedHistory.statusAudits} />
                </CardContent>
              </Card>
            )}

            {/* Logs de Atividades - se houver dados */}
            {expandedHistory.activityLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Logs de Atividades</CardTitle>
                  <CardDescription>
                    Registro de atividades do sistema relacionadas ao condutor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityLogList logs={expandedHistory.activityLogs} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

      {/* Mensagem quando não há dados */}
      {!isLoading &&
        expandedHistory.locations.length === 0 &&
        expandedHistory.statusAudits.length === 0 &&
        expandedHistory.activityLogs.length === 0 &&
        !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-12">
                <p>Selecione um condutor e período para gerar o relatório</p>
                <p className="text-sm mt-2">
                  Os dados serão exibidos aqui após a geração do relatório
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
