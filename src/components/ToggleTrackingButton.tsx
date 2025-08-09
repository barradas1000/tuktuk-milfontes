import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";
import { useDriverTracking } from "@/hooks/useDriverTracking";

interface ToggleTrackingButtonProps {
  conductorId: string;
}

const ToggleTrackingButton: React.FC<ToggleTrackingButtonProps> = ({
  conductorId,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  // Inicia o hook de tracking quando isTracking = true
  const { error: trackError, lastUpdateAt } = useDriverTracking(
    conductorId,
    isTracking,
    { minIntervalMs: 3000, minDeltaMeters: 8 }
  );

  // Verificar estado inicial e subscrever mudanças
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("conductors")
          .select("is_active")
          .eq("id", conductorId)
          .single();

        if (!error && data) {
          setIsTracking(data.is_active);
          console.log(
            `[ToggleTrackingButton] Estado inicial: ${data.is_active}`
          );
        }
      } catch (error) {
        console.error("Erro ao verificar status inicial:", error);
      }
    };

    checkInitialStatus();

    // Subscrever mudanças realtime para sincronização entre dispositivos
    const channel = supabase
      .channel(`conductor_status_${conductorId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Escutar todos os eventos
          schema: "public",
          table: "conductors",
          filter: `id=eq.${conductorId}`,
        },
        (payload) => {
          console.log(
            `[ToggleTrackingButton] Mudança realtime recebida:`,
            payload
          );
          if (payload.new && typeof payload.new === "object") {
            const newData = payload.new as { is_active: boolean };
            console.log(
              `[ToggleTrackingButton] Atualizando estado para: ${newData.is_active}`
            );
            setIsTracking(newData.is_active);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[ToggleTrackingButton] Status da subscrição: ${status}`);
      });

    // Polling como fallback (caso realtime falhe)
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("conductors")
          .select("is_active")
          .eq("id", conductorId)
          .single();

        if (!error && data) {
          setIsTracking(data.is_active);
        }
      } catch (error) {
        console.error("Erro no polling:", error);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      console.log(
        `[ToggleTrackingButton] Limpando subscrições para condutor ${conductorId}`
      );
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [conductorId]);

  const startTracking = async () => {
    setLoading(true);

    try {
      // Pedir permissão de localização
      if (!navigator.geolocation) {
        alert("Geolocalização não é suportada neste navegador.");
        return;
      }

      // Atualizar status no Supabase (ambas as tabelas)
      const timestamp = new Date().toISOString();

      // 1. Atualizar tabela conductors
      const { error: conductorError } = await supabase
        .from("conductors")
        .update({
          is_active: true,
          updated_at: timestamp,
        })
        .eq("id", conductorId);

      if (conductorError) {
        console.error("Erro ao ativar rastreamento:", conductorError);
        return;
      }

      console.log(
        `[ToggleTrackingButton] Condutor ${conductorId} ativado na BD`
      );

      // 2. Atualizar/inserir na tabela active_conductors
      const { error: activeError } = await supabase
        .from("active_conductors")
        .upsert({
          conductor_id: conductorId,
          is_available: true,
          updated_at: timestamp,
        });

      if (activeError) {
        console.error("Erro ao atualizar active_conductors:", activeError);
        // Reverter mudança se falhou
        await supabase
          .from("conductors")
          .update({ is_active: false })
          .eq("id", conductorId);
        return;
      }

      console.log(
        `[ToggleTrackingButton] Active_conductors atualizada para condutor ${conductorId}`
      );

      // Force local state update immediately
      setIsTracking(true);

      // Trigger a custom event to force other components to update
      window.dispatchEvent(
        new CustomEvent("conductorStatusChanged", {
          detail: { conductorId, isActive: true },
        })
      );

      console.log(
        `[ToggleTrackingButton] Condutor ${conductorId} ativado com sucesso`
      );
    } catch (error) {
      console.error("Erro ao iniciar rastreamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    setLoading(true);

    try {
      // Atualizar status no Supabase (ambas as tabelas)
      const timestamp = new Date().toISOString();

      // 1. Atualizar tabela conductors
      const { error: conductorError } = await supabase
        .from("conductors")
        .update({
          is_active: false,
          updated_at: timestamp,
        })
        .eq("id", conductorId);

      if (conductorError) {
        console.error("Erro ao desativar rastreamento:", conductorError);
        return;
      }

      console.log(
        `[ToggleTrackingButton] Condutor ${conductorId} desativado na BD`
      );

      // 2. Remover da tabela active_conductors
      const { error: activeError } = await supabase
        .from("active_conductors")
        .delete()
        .eq("conductor_id", conductorId);

      if (activeError) {
        console.error("Erro ao remover de active_conductors:", activeError);
        // Reverter mudança se falhou
        await supabase
          .from("conductors")
          .update({ is_active: true })
          .eq("id", conductorId);
        return;
      }

      console.log(
        `[ToggleTrackingButton] Removido de active_conductors: condutor ${conductorId}`
      );

      // Remover do mapa (será removido via realtime subscription no PassengerMap)
      console.log(
        `[ToggleTrackingButton] Condutor ${conductorId} desativado - removendo do mapa via realtime`
      );

      // Force local state update immediately
      setIsTracking(false);

      // Trigger a custom event to force other components to update
      window.dispatchEvent(
        new CustomEvent("conductorStatusChanged", {
          detail: { conductorId, isActive: false },
        })
      );
    } catch (error) {
      console.error("Erro ao parar rastreamento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Controlo de Rastreamento
        </h3>
        <p className="text-sm text-gray-600">
          {isTracking ? "🟢 TukTuk visível no mapa" : "🔴 TukTuk offline"}
        </p>
      </div>

      <Button
        onClick={isTracking ? stopTracking : startTracking}
        disabled={loading}
        className={`px-8 py-3 text-lg font-semibold ${
          isTracking
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {isTracking ? "A parar..." : "A iniciar..."}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isTracking ? "🛑 DESLIGAR" : "▶️ LIGAR"}
          </div>
        )}
      </Button>

      {isTracking && (
        <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
          📍 Enviando localização em tempo real...
          {lastUpdateAt && (
            <span className="ml-2 text-gray-600">
              últ.: {new Date(lastUpdateAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
      {trackError && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
          ⚠️ {trackError}
        </div>
      )}
    </div>
  );
};

export default ToggleTrackingButton;
