import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";

interface ToggleTrackingButtonProps {
  driverId: string;
}

const ToggleTrackingButton: React.FC<ToggleTrackingButtonProps> = ({
  driverId,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Verificar estado inicial
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("is_active")
          .eq("id", driverId)
          .single();

        if (!error && data) {
          setIsTracking(data.is_active);
        }
      } catch (error) {
        console.error("Erro ao verificar status inicial:", error);
      }
    };

    checkInitialStatus();
  }, [driverId]);

  const startTracking = async () => {
    setLoading(true);

    try {
      // Pedir permissão de localização
      if (!navigator.geolocation) {
        alert("Geolocalização não é suportada neste navegador.");
        return;
      }

      // Atualizar status no Supabase
      const { error: updateError } = await supabase
        .from("drivers")
        .update({ is_active: true })
        .eq("id", driverId);

      if (updateError) {
        console.error("Erro ao ativar rastreamento:", updateError);
        return;
      }

      // Iniciar watch de localização
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            await supabase
              .from("drivers")
              .update({
                latitude,
                longitude,
                updated_at: new Date().toISOString(),
              })
              .eq("id", driverId);
          } catch (error) {
            console.error("Erro ao atualizar localização:", error);
          }
        },
        (error) => {
          console.error("Erro de geolocalização:", error);
          alert("Erro ao obter localização. Verifique as permissões.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );

      setWatchId(id);
      setIsTracking(true);
    } catch (error) {
      console.error("Erro ao iniciar rastreamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    setLoading(true);

    try {
      // Parar watch de localização
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }

      // Atualizar status no Supabase
      const { error } = await supabase
        .from("drivers")
        .update({ is_active: false })
        .eq("id", driverId);

      if (error) {
        console.error("Erro ao desativar rastreamento:", error);
        return;
      }

      setIsTracking(false);
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
        </div>
      )}
    </div>
  );
};

export default ToggleTrackingButton;
