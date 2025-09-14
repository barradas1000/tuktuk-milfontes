import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Plus, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BlockedPeriod {
  id: string;
  date: string;
  time?: string;
  reason: string;
  isDayBlock: boolean;
  createdBy: string;
  createdAt: string;
}

interface BlockedPeriodsPanelProps {
  onBlock: (date: string, time?: string, reason?: string) => void;
  onUnblock: (blockId: string) => void;
}

const BlockedPeriodsPanel: React.FC<BlockedPeriodsPanelProps> = ({
  onBlock,
  onUnblock
}) => {
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'days' | 'hours'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('');
  const [blockTime, setBlockTime] = useState<string>('');
  const [isBlocking, setIsBlocking] = useState(false);

  // Dados simulados - em produção viriam do Supabase
  useEffect(() => {
    const sampleBlocks: BlockedPeriod[] = [
      {
        id: 'block-1',
        date: '2025-08-24',
        reason: 'Folga',
        isDayBlock: true,
        createdBy: 'Admin',
        createdAt: '2025-08-20T10:00:00Z'
      },
      {
        id: 'block-2',
        date: '2025-08-24',
        time: '14:00',
        reason: 'Manutenção veicular',
        isDayBlock: false,
        createdBy: 'Admin',
        createdAt: '2025-08-20T10:30:00Z'
      },
      {
        id: 'block-3',
        date: '2025-08-26',
        reason: 'Feriado',
        isDayBlock: true,
        createdBy: 'System',
        createdAt: '2025-08-01T10:00:00Z'
      },
      {
        id: 'block-4',
        date: '2025-08-27',
        reason: 'Condições meteorológicas',
        isDayBlock: true,
        createdBy: 'Admin',
        createdAt: '2025-08-25T18:00:00Z'
      }
    ];

    setBlockedPeriods(sampleBlocks);
  }, []);

  // Filtrar bloqueios baseados no tipo selecionado
  const filteredBlocks = blockedPeriods.filter(block => {
    switch (filterType) {
      case 'days':
        return block.isDayBlock;
      case 'hours':
        return !block.isDayBlock;
      default:
        return true;
    }
  });

  // Contadores por tipo
  const dayBlocksCount = blockedPeriods.filter(b => b.isDayBlock).length;
  const hourBlocksCount = blockedPeriods.filter(b => !b.isDayBlock).length;

  const handleBlock = async () => {
    if (!selectedDate) {
      alert('Selecione uma data para bloquear');
      return;
    }

    setIsBlocking(true);

    try {
      const newBlock: BlockedPeriod = {
        id: `block-${Date.now()}`,
        date: selectedDate,
        time: blockTime || undefined,
        reason: blockReason || 'Bloqueado pelo admin',
        isDayBlock: !blockTime,
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
      };

      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setBlockedPeriods(prev => [...prev, newBlock]);

      if (onBlock) {
        onBlock(selectedDate, blockTime, blockReason);
      }

      // Limpar campos
      setSelectedDate('');
      setBlockTime('');
      setBlockReason('');
    } catch (error) {
      console.error('Erro ao bloquear:', error);
      alert('Erro ao bloquear período');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 500));

      setBlockedPeriods(prev => prev.filter(b => b.id !== blockId));

      if (onUnblock) {
        onUnblock(blockId);
      }
    } catch (error) {
      console.error('Erro ao desbloquear:', error);
      alert('Erro ao desbloquear período');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Lock className="w-5 h-5" />
          Visualização de Bloqueios
        </CardTitle>
        <div className="text-sm text-gray-600">
          Gerencie bloqueios de dias completos e horários específicos
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtros e Estatísticas */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-orange-800">Filtrar por:</span>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'days' | 'hours')}>
              <SelectTrigger className="w-32 border-orange-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="days">Apenas Dias</SelectItem>
                <SelectItem value="hours">Apenas Horários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contadores visuais */}
          <div className="flex gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Dias: {dayBlocksCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Horários: {hourBlocksCount}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Formulário para novo bloqueio */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Bloqueio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium text-orange-700 mb-1 block">
                Data *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-orange-200 rounded px-3 py-2 w-full text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-orange-700 mb-1 block">
                Horário (opcional - apenas horário)
              </label>
              <input
                type="time"
                value={blockTime}
                onChange={(e) => setBlockTime(e.target.value)}
                className="border border-orange-200 rounded px-3 py-2 w-full text-sm"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium text-orange-700 mb-1 block">
              Motivo
            </label>
            <input
              type="text"
              placeholder="Ex: Folga, Manutenção, Feriado..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="border border-orange-200 rounded px-3 py-2 w-full text-sm"
            />
          </div>

          <Button
            onClick={handleBlock}
            disabled={isBlocking || !selectedDate}
            className="bg-orange-600 hover:bg-orange-700 text-white w-full"
          >
            {isBlocking ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2 animate-spin" />
                Bloqueando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Bloquear Período
              </>
            )}
          </Button>
        </div>

        {/* Lista de Bloqueios */}
        <div className="space-y-3">
          <h4 className="font-semibold text-orange-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Bloqueios Ativos ({filteredBlocks.length})
          </h4>

          {filteredBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum bloqueio encontrado para este filtro</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredBlocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {block.isDayBlock ? 'Dia Completo' : `Horário: ${block.time}`}
                      </Badge>
                      <span className="font-medium text-orange-800">
                        {new Date(block.date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                      <strong>Motivo:</strong> {block.reason}
                    </div>

                    <div className="text-xs text-gray-500">
                      Bloqueado por {block.createdBy} em {new Date(block.createdAt).toLocaleDateString('pt-PT')}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleUnblock(block.id)}
                    variant="destructive"
                    size="sm"
                    className="ml-4"
                  >
                    <Unlock className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Estatístico */}
        <div className="mt-6 p-4 bg-orange-100 rounded-lg border border-orange-300">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-orange-800">Total de bloqueios:</span>
            <div className="flex gap-4 text-orange-700">
              <span>Dias: {dayBlocksCount}</span>
              <span>Horários: {hourBlocksCount}</span>
              <span className="font-bold">Total: {blockedPeriods.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockedPeriodsPanel;
