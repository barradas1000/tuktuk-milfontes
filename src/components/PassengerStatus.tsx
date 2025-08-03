import React, { useEffect, useState } from "react";
import {
  fetchActiveConductors,
  fetchTuktukStatus,
} from "../services/supabaseService";

const PassengerStatus: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hasActive, setHasActive] = useState(false);
  const [status, setStatus] = useState<"available" | "busy" | null>(null);
  const [occupiedUntil, setOccupiedUntil] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true);
      const activeIds = await fetchActiveConductors();
      if (!activeIds || activeIds.length === 0) {
        setHasActive(false);
        setStatus(null);
        setOccupiedUntil(null);
        setLoading(false);
        return;
      }
      setHasActive(true);
      // Considera apenas o primeiro condutor ativo
      const tuktuk = await fetchTuktukStatus(activeIds[0]);
      setStatus(tuktuk?.status || null);
      setOccupiedUntil(tuktuk?.occupied_until || null);
      setLoading(false);
    };
    loadStatus();
    // Opcional: polling para atualização
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Carregando status do TukTuk...
      </div>
    );
  }

  if (!hasActive) {
    return (
      <div className="text-center py-4 text-red-600 font-bold text-lg">
        🚫 TukTuk offline
      </div>
    );
  }

  if (status === "available") {
    return (
      <div className="text-center py-4 text-green-700 font-bold text-lg">
        🟢 TukTuk Está Disponível Neste Momento
      </div>
    );
  }

  if (status === "busy") {
    let hora = "";
    if (occupiedUntil) {
      const d = new Date(occupiedUntil);
      hora = d.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return (
      <div className="text-center py-4 text-yellow-700 font-bold text-lg">
        🟡 TukTuk Neste Momento Está Ocupado
        {hora && (
          <span className="ml-2 text-yellow-800 font-semibold text-base">
            Previsão de Disponibilidade: {hora}
          </span>
        )}
      </div>
    );
  }

  return null;
};

export default PassengerStatus;
