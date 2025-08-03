import { supabase } from "@/lib/supabase";
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
// Importe supabase conforme necessário

export interface Conductor {
  id: string;
  name: string;
  whatsapp?: string;
  status?: string;
}

export interface AdminConductorStatusCardProps {
  conductor: Conductor;
  isActive: boolean;
  onActiveChange: (checked: boolean) => void;
}

const AdminConductorStatusCard: React.FC<AdminConductorStatusCardProps> = ({
  conductor,
  isActive,
  onActiveChange,
}) => {
  const [status, setStatus] = React.useState<string>(
    conductor.status || "disponivel"
  );
  const [busyMinutes, setBusyMinutes] = React.useState<number>(30);
  const [loading, setLoading] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setLoading(true);
    let busy_until = null;
    if (newStatus === "ocupado") {
      const now = new Date();
      busy_until = new Date(now.getTime() + busyMinutes * 60000).toISOString();
    }
    try {
      await supabase
        .from("conductors")
        .update({ status: newStatus, busy_until })
        .eq("id", conductor.id);
    } catch (e) {
      // erro
    } finally {
      setLoading(false);
    }
  };

  const handleBusyMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusyMinutes(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 min-w-[220px]">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800">{conductor.name}</span>
        {conductor.whatsapp && (
          <span className="ml-2 text-xs text-gray-500">
            ({conductor.whatsapp})
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isActive}
          onCheckedChange={onActiveChange}
          id={`switch-${conductor.id}`}
        />
        <span
          className={
            isActive ? "text-green-600 font-semibold" : "text-gray-400"
          }
        >
          {isActive ? "Ativo" : "Inativo"}
        </span>
      </div>
      {isActive && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Status:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading}
            >
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
            </select>
          </div>
          {status === "ocupado" && (
            <div className="flex gap-2 items-center">
              <label className="text-sm">Tempo ocupado (min):</label>
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={busyMinutes}
                onChange={handleBusyMinutesChange}
                className="border rounded px-2 py-1 w-16 text-sm"
                disabled={loading}
              />
              <Button
                size="sm"
                onClick={() => handleStatusChange("ocupado")}
                disabled={loading}
              >
                Definir Ocupado
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminConductorStatusCard;
