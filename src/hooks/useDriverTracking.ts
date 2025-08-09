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
    minDeltaMeters = 8,
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
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
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
      const last = lastPosRef.current;
      if (now - lastSentRef.current < minIntervalMs) return;

      if (last) {
        const d = distMeters(
          last.coords.latitude,
          last.coords.longitude,
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (d < minDeltaMeters) return; // ignora jitter
      }

      lastPosRef.current = pos;
      lastSentRef.current = now;

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Atualiza a linha do condutor (ajuste nomes das colunas conforme seu schema)
      const { error: updErr } = await supabase
        .from("conductors")
        .update({
          latitude: lat,
          longitude: lng,
          is_active: true,
          updated_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .eq("id", conductorId);

      if (updErr) {
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
