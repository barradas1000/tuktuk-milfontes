import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

// Haversine em metros
function distMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type UseDriverTrackingOpts = {
  minIntervalMs?: number; // default 3000 ms
  minDeltaMeters?: number; // default 8 m
  highAccuracy?: boolean; // default true
  trackingEnabled?: boolean; // default true - controla se o rastreamento está ativo
};

export function useDriverTracking(
  conductorId: string | null,
  enabled: boolean,
  opts: UseDriverTrackingOpts = {}
) {
  const {
    minIntervalMs = 3000, // 3 segundos
    minDeltaMeters = 2, // só envia se mover pelo menos 2 metros
    highAccuracy = true,
    trackingEnabled = true, // por padrão, o rastreamento está ativo
  } = opts;

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);
  const lastPosRef = useRef<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);

  // Cleanup global ao montar/desmontar o hook
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Se desligar, tracking desativado ou não tiver id, parar qualquer watch ativo
    if (!enabled || !trackingEnabled || !conductorId) {
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        console.log(
          `[useDriverTracking] Limpando watchPosition (ID: ${watchIdRef.current}). Causa: Tracking desativado ou ID do condutor ausente.`
        );
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    console.log("[useDriverTracking] Tentando iniciar watchPosition...", {
      enabled,
      conductorId,
    });
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocalização não suportada neste dispositivo/navegador.");
      return;
    }

    // Em mobile, geolocalização requer HTTPS (exceto localhost)
    if (!isSecureContext && location.hostname !== "localhost") {
      setError("Geolocalização requer HTTPS em dispositivos móveis.");
      return;
    }

    const onSuccess = async (pos: GeolocationPosition) => {
      const now = Date.now();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Validação das coordenadas
      const isValid =
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

      if (!isValid) {
        setError("Coordenadas inválidas recebidas do dispositivo.");
        console.warn("[useDriverTracking] Coordenadas inválidas:", {
          lat,
          lng,
        });
        alert(
          "Erro: Coordenadas inválidas recebidas do dispositivo. Verifique permissões e GPS."
        );
        return;
      }

      // Throttling: só envia se mudou o suficiente ou passou tempo mínimo
      if (lastPosRef.current) {
        const prev = lastPosRef.current.coords;
        const delta = distMeters(prev.latitude, prev.longitude, lat, lng);
        if (
          delta < minDeltaMeters &&
          now - lastSentRef.current < minIntervalMs
        ) {
          // Ignora update
          return;
        }
      }

      lastPosRef.current = pos;
      lastSentRef.current = now;

      // [INÍCIO] Envio de coordenadas desativado - Para reativar, descomente todo este bloco
      // console.log(
      //   `[useDriverTracking] Enviando localização para active_conductors:`,
      //   {
      //     latitude: lat,
      //     longitude: lng,
      //     conductorId,
      //   }
      // );

      // const { error: updErr } = await supabase.from("active_conductors").upsert(
      //   {
      //     conductor_id: conductorId,
      //     current_latitude: lat,
      //     current_longitude: lng,
      //     is_active: true,
      //     is_available: true, // Ajuste conforme lógica de disponibilidade
      //     status: "available",
      //     updated_at: new Date(now).toISOString(),
      //     last_seen: new Date(now).toISOString(),
      //   },
      //   { onConflict: "conductor_id" }
      // );

      // if (updErr) {
      //   console.error("[useDriverTracking] Erro ao upsert Supabase:", updErr);
      //   setError(updErr.message);
      //   alert("Erro ao enviar localização para Supabase: " + updErr.message);
      // } else {
      //   setError(null);
      //   setLastUpdateAt(now);
      // }
      // [FIM] Envio de coordenadas desativado

      // Simular sucesso para manter a funcionalidade da interface
      console.log(
        `[useDriverTracking] [SIMULADO] Localização obtida (não enviada para Supabase):`,
        {
          latitude: lat,
          longitude: lng,
          conductorId,
        }
      );
      setError(null);
      setLastUpdateAt(now);
    };

    const onError = (e: GeolocationPositionError) => {
      setError(e.message || "Erro de geolocalização");
      alert("Erro de geolocalização: " + (e.message || "Erro desconhecido"));
    };

    const options: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      maximumAge: 2000, // Equilíbrio: permite cache de até 2s
      timeout: 7000, // Equilíbrio: espera até 7s por fix
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      options
    );

    // Cleanup quando dependências mudarem
    return () => {
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, conductorId, minIntervalMs, minDeltaMeters, highAccuracy, trackingEnabled]);

  return { error, lastUpdateAt };
}
