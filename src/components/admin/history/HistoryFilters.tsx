import React from 'react';
import { Conductor, ExpandedHistoryFilters } from '@/types/history';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface HistoryFiltersProps {
  conductors: Conductor[];
  onGenerateReport: (filters: ExpandedHistoryFilters) => void;
  isLoading: boolean;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  conductors,
  onGenerateReport,
  isLoading
}) => {
  const [selectedConductor, setSelectedConductor] = React.useState<string>('');
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    to: new Date()
  });
  const [includeStatusAudit, setIncludeStatusAudit] = React.useState<boolean>(true);
  const [includeActivityLogs, setIncludeActivityLogs] = React.useState<boolean>(true);
  const [actionFilter, setActionFilter] = React.useState<string>('');

  const handleGenerate = () => {
    if (!selectedConductor) return;
    
    onGenerateReport({
      conductorId: selectedConductor,
      dateRange,
      includeStatusAudit,
      includeActivityLogs,
      actionFilter: actionFilter || undefined
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Filtrar Histórico</h3>
      
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Seleção de Condutor */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Condutor</label>
          <Select value={selectedConductor} onValueChange={setSelectedConductor}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar condutor" />
            </SelectTrigger>
            <SelectContent>
              {conductors.map((conductor) => (
                <SelectItem key={conductor.id} value={conductor.id}>
                  {conductor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período de Data */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Período</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy', { locale: pt })} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: pt })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy', { locale: pt })
                  )
                ) : (
                  <span>Selecionar datas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
                locale={pt}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtros Adicionais */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Dados Adicionais</label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeStatusAudit"
              checked={includeStatusAudit}
              onCheckedChange={(checked) => setIncludeStatusAudit(checked === true)}
            />
            <label htmlFor="includeStatusAudit" className="text-sm font-medium leading-none">
              Incluir histórico de status
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeActivityLogs"
              checked={includeActivityLogs}
              onCheckedChange={(checked) => setIncludeActivityLogs(checked === true)}
            />
            <label htmlFor="includeActivityLogs" className="text-sm font-medium leading-none">
              Incluir logs de atividades
            </label>
          </div>
          {includeActivityLogs && (
            <div className="mt-2">
              <label htmlFor="actionFilter" className="text-sm font-medium mb-1 block">
                Filtrar ações (opcional)
              </label>
              <Input
                id="actionFilter"
                placeholder="Ex: update, create, delete"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Botão Gerar */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !selectedConductor}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Relatório'
          )}
        </Button>
      </div>
    </div>
  );
};
