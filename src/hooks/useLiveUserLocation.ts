import { useCallback, useEffect, useRef, useState } from "react";

type PermissionState = "granted" | "denied" | "prompt" | "unknown";

interface Options {
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
  minIntervalMs?: number; // throttle
}

export function useLiveUserLocation(opts: Options = {}) {
  const {
    enableHighAccuracy = true,
    timeoutMs = 10000,
    maximumAgeMs = 2000,
    minIntervalMs = 3000,
  } = opts;

  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastEmitRef = useRef<number>(0);

  // Try read permission (not supported in all browsers)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore
        const res = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });
        if (!cancelled && res) {
          setPermission(res.state as PermissionState);
          res.onchange = () => setPermission(res.state as PermissionState);
        } else if (!cancelled) {
          setPermission("unknown");
        }
      } catch {
        if (!cancelled) setPermission("unknown");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clear = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation não suportada");
      return;
    }
    if (watchIdRef.current != null) return; // already watching
    setError(null);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastEmitRef.current < minIntervalMs) return; // throttle
        lastEmitRef.current = now;
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy ?? null);
      },
      (err) => setError(err.message || "Erro de geolocalização"),
      {
        enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: maximumAgeMs,
      }
    );
    watchIdRef.current = id;
    setIsWatching(true);
  }, [enableHighAccuracy, maximumAgeMs, minIntervalMs, timeoutMs]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return {
    permission,
    position,
    accuracy,
    error,
    isWatching,
    start,
    stop: clear,
  };
}
