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
};

export function useDriverTracking(
  conductorId: string | null,
  enabled: boolean,
  opts: UseDriverTrackingOpts = {}
) {
  const {
    minIntervalMs = 3000,
    minDeltaMeters = 2,
    highAccuracy = true,
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
    // Se desligar ou não tiver id, parar qualquer watch ativo
    if (!enabled || !conductorId) {
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

      console.log(
        `[useDriverTracking] Enviando localização para active_conductors:`,
        {
          latitude: lat,
          longitude: lng,
          conductorId,
        }
      );

      const { error: updErr } = await supabase.from("active_conductors").upsert(
        {
          conductor_id: conductorId,
          current_latitude: lat,
          current_longitude: lng,
          is_active: true,
          is_available: true, // Ajuste conforme lógica de disponibilidade
          status: "available",
          updated_at: new Date(now).toISOString(),
          last_seen: new Date(now).toISOString(),
        },
        { onConflict: "conductor_id" }
      );

      if (updErr) {
        console.error("[useDriverTracking] Erro ao upsert Supabase:", updErr);
        setError(updErr.message);
      } else {
        setError(null);
        setLastUpdateAt(now);
      }
    };

    const onError = (e: GeolocationPositionError) => {
      setError(e.message || "Erro de geolocalização");
    };

    const options: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      maximumAge: 2000,
      timeout: 10000,
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
  }, [enabled, conductorId, minIntervalMs, minDeltaMeters, highAccuracy]);

  return { error, lastUpdateAt };
}
