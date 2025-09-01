import React from 'react';
import { Switch } from "@/components/ui/switch";
import { useActiveConductors } from "@/hooks/useActiveConductors";

interface ActiveConductorsPanelProps {
  conductors: ReturnType<typeof useActiveConductors>['conductors'];
  loading: boolean;
  error: string | null;
  updateConductorStatus: (conductorId: string, newStatus: boolean) => Promise<boolean>;
  getCurrentWhatsapp: () => string;
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
  getCurrentWhatsapp,
  renderAfterActiveBlock,
}) => {
  const activeConductors = conductors.filter(c => c.is_active);
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
          conductors.map((c) => (
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

      <div className="mt-4 text-base text-purple-900 font-semibold">
        WhatsApp responsável:{" "}
        <span className="text-purple-700">{getCurrentWhatsapp()}</span>
      </div>

      {renderAfterActiveBlock &&
        renderAfterActiveBlock({
          activeConductors: activeConductorIds,
          activeConductorsWithNames: activeConductorsWithNames,
        })}
    </div>
  );
};

export default ActiveConductorsPanel;
