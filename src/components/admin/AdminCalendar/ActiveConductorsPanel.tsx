import React from 'react';
import { Switch } from "@/components/ui/switch";
import { useActiveConductors } from "@/hooks/useActiveConductors";
/*
  Certifique-se de que o caminho do import está correto.
  Se o arquivo useActiveConductors.ts estiver em src/hooks, use:
  Caso contrário, mantenha o caminho relativo:
*/
interface ActiveConductorsPanelProps {
  conductors: ReturnType<typeof useActiveConductors>['conductors'];
  loading: boolean;
  error: string | null;
  updateConductorStatus: (conductorId: string, newStatus: boolean) => Promise<boolean>;
  renderAfterActiveBlock?: (params: {
    activeConductors: string[];
    activeConductorsWithNames: { id: string; name: string }[];
  }) => React.ReactNode;
}

const ActiveConductorsPanel: React.FC<ActiveConductorsPanelProps> = ({
  conductors,
  loading,
  error,
  updateConductorStatus,
  renderAfterActiveBlock,
}) => {
  const activeConductors = conductors ? conductors.filter(c => c.is_active) : [];
  const activeConductorIds = activeConductors.map(c => c.conductor_id);
  const activeConductorsWithNames = activeConductors.map(c => ({ id: c.conductor_id, name: c.name || '' }));

  return (
    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col gap-3 items-center shadow-md">
      <h2 className="text-lg font-bold text-purple-900 mb-2">
        Condutores Ativos
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        {loading ? (
          <p>A carregar condutores...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          (conductors ?? []).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200"
            >
              <span className="font-semibold text-gray-800 min-w-[90px] flex items-center gap-2">
                {c.name || `Condutor s/ nome`}
              </span>
              <Switch
                checked={c.is_active}
                onCheckedChange={(checked) => {
                  updateConductorStatus(c.id, checked);
                }}
                id={`switch-${c.id}`}
              />
              <span
                className={
                  c.is_active
                    ? "text-green-600 font-semibold"
                    : "text-gray-400"
                }
              >
                {c.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))
        )}
      </div>

      {activeConductors.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            WhatsApp dos Condutores Ativos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeConductors.map((conductor) => (
              <div
                key={conductor.id}
                className="bg-white rounded-lg p-4 shadow-md border border-purple-200"
              >
                <h4 className="font-bold text-purple-800 text-lg">
                  {conductor.name || "Condutor sem nome"}
                </h4>
                <p className="text-gray-600 mt-2">
                  Status:{" "}
                  <span className="text-purple-700 font-medium">
                    {conductor.is_available ? "Disponível" : "Ocupado"}
                  </span>
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderAfterActiveBlock &&
        renderAfterActiveBlock({
          activeConductors: activeConductorIds,
          activeConductorsWithNames: activeConductorsWithNames,
        })}
    </div>
  );
};

export default ActiveConductorsPanel;
