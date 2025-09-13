import React from 'react';
import { StatusAudit } from '@/types/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface StatusAuditListProps {
  audits: StatusAudit[];
}

export const StatusAuditList: React.FC<StatusAuditListProps> = ({ audits }) => {
  if (audits.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">
        Nenhum registro de status encontrado para o período selecionado.
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'busy':
        return 'destructive';
      case 'available':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {audits.map((audit) => (
        <Card key={audit.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Alteração de Status
              </CardTitle>
              <Badge variant={getStatusBadgeVariant(audit.new_status)}>
                {audit.new_status}
              </Badge>
            </div>
            <CardDescription>
              {format(new Date(audit.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status Anterior:</span>
                <Badge variant="outline" className="ml-2">
                  {audit.old_status || 'N/A'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Alterado por:</span>
                <span className="ml-2">{audit.changed_by || 'Sistema'}</span>
              </div>
            </div>
            {audit.reason && (
              <div className="mt-3">
                <span className="font-medium">Motivo:</span>
                <p className="text-sm text-muted-foreground mt-1">{audit.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};