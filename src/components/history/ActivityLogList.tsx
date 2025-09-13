import React from 'react';
import { ActivityLog } from '@/types/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ActivityLogListProps {
  logs: ActivityLog[];
}

export const ActivityLogList: React.FC<ActivityLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">
        Nenhum log de atividade encontrado para o período selecionado.
      </div>
    );
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'status_change':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatAdditionalData = (data: Record<string, unknown> | null): string => {
    if (!data) return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Dados adicionais não disponíveis';
    }
  };

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {log.resource_type === 'conductor' ? 'Condutor' : 'Recurso'} - {log.resource_id || 'N/A'}
              </CardTitle>
              <Badge variant={getActionBadgeVariant(log.action)}>
                {log.action}
              </Badge>
            </div>
            <CardDescription>
              {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tipo de Recurso:</span>
                <span className="ml-2 capitalize">{log.resource_type}</span>
              </div>
              <div>
                <span className="font-medium">ID do Recurso:</span>
                <span className="ml-2">{log.resource_id || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Executado por:</span>
                <span className="ml-2">{log.user_id || 'Sistema'}</span>
              </div>
              <div>
                <span className="font-medium">IP:</span>
                <span className="ml-2">{log.ip_address || 'N/A'}</span>
              </div>
            </div>
            {log.additional_data && (
              <div className="mt-3">
                <span className="font-medium">Dados Adicionais:</span>
                <pre className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded overflow-auto">
                  {formatAdditionalData(log.additional_data)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};