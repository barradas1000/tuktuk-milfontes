import React from "react";
import { BlockedPeriod } from "./types";

interface BlockedPeriodsPanelProps {
  blockedPeriods: BlockedPeriod[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const BlockedPeriodsPanel: React.FC<BlockedPeriodsPanelProps> = ({
  blockedPeriods,
  onAdd,
  onRemove,
}) => {
  return (
    <div>
      <h3>Períodos Bloqueados</h3>
      <ul>
        {blockedPeriods.map((period) => (
          <li key={period.id}>
            {period.start} - {period.end}
            <button onClick={() => onRemove(period.id)}>Remover</button>
          </li>
        ))}
      </ul>
      <button onClick={onAdd}>Adicionar Período</button>
    </div>
  );
};

export default BlockedPeriodsPanel;
