import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TuktukAvailabilityPanelProps {
  tuktukStatus: "available" | "busy";
  setTuktukStatus: (status: "available" | "busy") => void;
  occupiedUntil: Date | null;
  setOccupiedUntil: (date: Date | null) => void;
  occupiedMinutes: number;
  setOccupiedMinutes: (minutes: number) => void;
  activeConductorIds: string[];
  updateTuktukStatus: (conductorId: string, status: "available" | "busy", occupiedUntil: Date | null) => Promise<void>;
}

const TuktukAvailabilityPanel: React.FC<TuktukAvailabilityPanelProps> = ({
  tuktukStatus,
  setTuktukStatus,
  occupiedUntil,
  setOccupiedUntil,
  occupiedMinutes,
  setOccupiedMinutes,
  activeConductorIds,
  updateTuktukStatus,
}) => {
  const { toast } = useToast();

  return (
    <div
      className={`mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col gap-4 items-center shadow-md ${
        activeConductorIds.length !== 1
          ? "opacity-60 pointer-events-none"
          : ""
      }`}
    >
      <h2 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
        <Clock className="h-5 w-5" /> Disponibilidade do TukTuk
      </h2>
      <div className="flex flex-col md:flex-row gap-4 items-center w-full justify-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">Status:</span>
          <Switch
            checked={tuktukStatus === "available"}
            onCheckedChange={async (checked) => {
              if (activeConductorIds.length === 1) {
                const conductorId = activeConductorIds[0];
                if (checked) {
                  setTuktukStatus("available");
                  setOccupiedUntil(null);
                  await updateTuktukStatus(conductorId, "available", null);
                } else {
                  setTuktukStatus("busy");
                  await updateTuktukStatus(
                    conductorId,
                    "busy",
                    occupiedUntil
                  );
                }
              } else {
                // fallback local
                if (checked) {
                  setTuktukStatus("available");
                  setOccupiedUntil(null);
                } else {
                  setTuktukStatus("busy");
                }
              }
            }}
            id="switch-tuktuk-status"
            disabled={activeConductorIds.length !== 1}
          />
          <span
            className={
              tuktukStatus === "available"
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {tuktukStatus === "available" ? "Disponível" : "Ocupado"}
          </span>
        </div>
        {tuktukStatus === "busy" && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Tempo previsto ocupado:</span>
            <input
              type="number"
              min={1}
              max={180}
              value={occupiedMinutes}
              onChange={(e) => setOccupiedMinutes(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 text-center"
              disabled={activeConductorIds.length !== 1}
            />
            <span className="text-xs text-gray-500">minutos</span>
            <Button
              size="sm"
              variant="default"
              onClick={async () => {
                const until = new Date(
                  Date.now() + occupiedMinutes * 60000
                );
                setOccupiedUntil(until);
                if (activeConductorIds.length === 1) {
                  const conductorId = activeConductorIds[0];
                  await updateTuktukStatus(conductorId, "busy", until);
                }
                toast({
                  title: "TukTuk marcado como Ocupado",
                  description: `Disponível a partir das ${until.toLocaleTimeString(
                    "pt-PT",
                    { hour: "2-digit", minute: "2-digit" }
                  )}`,
                  variant: "default",
                });
              }}
              disabled={
                !occupiedMinutes ||
                occupiedMinutes < 1 ||
                activeConductorIds.length !== 1
              }
            >
              Confirmar
            </Button>
          </div>
        )}
      </div>
      {tuktukStatus === "busy" && occupiedUntil && (
        <div className="text-sm text-red-700 mt-2">
          Ocupado até:{" "}
          <b>
            {occupiedUntil.toLocaleTimeString("pt-PT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </b>
        </div>
      )}
      {tuktukStatus === "available" && (
        <div className="text-sm text-green-700 mt-2">
          TukTuk disponível para novas viagens!
        </div>
      )}
    </div>
  );
};

export default TuktukAvailabilityPanel;
