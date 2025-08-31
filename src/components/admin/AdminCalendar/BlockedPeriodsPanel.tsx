import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Lock, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface BlockedPeriod {
  id: string;
  date: string;
  startTime?: string;
  reason?: string;
}

interface BlockedPeriodsPanelProps {
  getFilteredBlocks: () => BlockedPeriod[];
  blockFilterType: "all" | "days" | "hours";
  setBlockFilterType: (type: "all" | "days" | "hours") => void;
  blockFilterDate: string;
  setBlockFilterDate: (date: string) => void;
  unblockDay: (date: Date) => Promise<void>;
  unblockTime: (date: Date, time: string) => Promise<void>;
  blockedPeriods: BlockedPeriod[];
}

const BlockedPeriodsPanel: React.FC<BlockedPeriodsPanelProps> = ({
  getFilteredBlocks,
  blockFilterType,
  setBlockFilterType,
  blockFilterDate,
  setBlockFilterDate,
  unblockDay,
  unblockTime,
  blockedPeriods,
}) => {
  return (
    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-md">
      <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5" />
        Visualização de Bloqueios
      </h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-orange-800"
            htmlFor="block-filter-type"
          >
            Filtrar por:
          </label>
          <select
            id="block-filter-type"
            name="block-filter-type"
            value={blockFilterType}
            onChange={(e) =>
              setBlockFilterType(e.target.value as "all" | "days" | "hours")
            }
            className="border border-orange-200 rounded px-2 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="days">Apenas Dias</option>
            <option value="hours">Apenas Horários</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-orange-800"
            htmlFor="block-filter-date"
          >
            Data:
          </label>
          <input
            id="block-filter-date"
            name="block-filter-date"
            type="date"
            value={blockFilterDate}
            onChange={(e) => setBlockFilterDate(e.target.value)}
            className="border border-orange-200 rounded px-2 py-1 text-sm"
          />
          {blockFilterDate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBlockFilterDate("")}
              className="text-xs"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dias Bloqueados */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Dias Bloqueados (
            {getFilteredBlocks().filter((b) => !b.startTime).length})
          </h3>
          {getFilteredBlocks().filter((b) => !b.startTime).length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              {blockFilterType === "hours"
                ? "Filtro aplicado: apenas horários"
                : "Nenhum dia bloqueado"}
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getFilteredBlocks()
                .filter((b) => !b.startTime)
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-100"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-sm">
                        {format(new Date(block.date), "dd/MM/yyyy", {
                          locale: pt,
                        })}
                      </span>
                      {block.reason && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({block.reason})
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => unblockDay(new Date(block.date))}
                    >
                      Desbloquear
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Horários Bloqueados */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horários Bloqueados (
            {getFilteredBlocks().filter((b) => b.startTime).length})
          </h3>
          {getFilteredBlocks().filter((b) => b.startTime).length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              {blockFilterType === "days"
                ? "Filtro aplicado: apenas dias"
                : "Nenhum horário bloqueado"}
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[
                ...new Map(
                  getFilteredBlocks()
                    .filter((b) => b.startTime)
                    .map((block) => [
                      block.date + "-" + block.startTime,
                      block,
                    ])
                ).values(),
              ].map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-100"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {format(new Date(block.date), "dd/MM", {
                        locale: pt,
                      })}{" "}
                      às {block.startTime}
                    </div>
                    {block.reason && (
                      <span className="text-xs text-gray-500">
                        {block.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      unblockTime(new Date(block.date), block.startTime!)
                    }
                  >
                    Desbloquear
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-orange-800">
            {blockFilterDate || blockFilterType !== "all"
              ? `Bloqueios filtrados: ${getFilteredBlocks().length}`
              : `Total de bloqueios: ${blockedPeriods.length}`}
          </span>
          <div className="flex gap-4 text-xs text-orange-700">
            <span>
              Dias: {getFilteredBlocks().filter((b) => !b.startTime).length}
            </span>
            <span>
              Horários:{" "}
              {getFilteredBlocks().filter((b) => b.startTime).length}
            </span>
          </div>
        </div>
        {(blockFilterDate || blockFilterType !== "all") && (
          <div className="mt-2 text-xs text-orange-600">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBlockFilterDate("");
                setBlockFilterType("all");
              }}
              className="text-xs h-6"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedPeriodsPanel;