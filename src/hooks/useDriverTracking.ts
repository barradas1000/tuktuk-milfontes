import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface TrackingOptions {
  minIntervalMs: number;
  minDeltaMeters: number;
  trackingEnabled: boolean;
}

interface TrackingState {
  error: string | null;
  lastUpdateAt: Date | null;
  isUpdating: boolean;
}

export const useDriverTracking = (
  conductorId: string,
  isTracking: boolean,
  options: TrackingOptions
) => {
  const [state, setState] = useState<TrackingState>({
    error: null,
    lastUpdateAt: null,
    isUpdating: false,
  });

  const [lastPosition, setLastPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [watchId, setWatchId] = useState<number | null>(null);

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  const updateLocation = useCallback(async (
    latitude: number,
    longitude: number,
    accuracy: number
  ) => {
    if (!conductorId) return;

    // Check if position changed enough
    if (lastPosition) {
      const distance = calculateDistance(
        lastPosition.lat,
        lastPosition.lng,
        latitude,
        longitude
      );

      if (distance < options.minDeltaMeters) {
        console.log('[useDriverTracking] Position change too small, skipping update');
        return;
      }
    }

    setState(prev => ({ ...prev, isUpdating: true }));

    try {
      const timestamp = new Date().toISOString();
      const { error } = await supabase
        .from('active_conductors')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          accuracy: accuracy,
          updated_at: timestamp,
        })
        .eq('conductor_id', conductorId)
        .eq('is_active', true);

      if (error) {
        console.error('[useDriverTracking] Error updating location:', error);
        setState(prev => ({
          ...prev,
          error: error.message,
          isUpdating: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: null,
          lastUpdateAt: new Date(),
          isUpdating: false,
        }));
        setLastPosition({ lat: latitude, lng: longitude });
        console.log('[useDriverTracking] Location updated successfully');
      }
    } catch (err) {
      console.error('[useDriverTracking] Unexpected error:', err);
      setState(prev => ({
        ...prev,
        error: 'Erro inesperado ao atualizar localização',
        isUpdating: false,
      }));
    }
  }, [conductorId, lastPosition, calculateDistance, options.minDeltaMeters]);

  const startTracking = useCallback(() => {
    if (watchId !== null || !navigator.geolocation) {
      return;
    }

    console.log('[useDriverTracking] Starting location tracking');

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('[useDriverTracking] Received position:', latitude, longitude);
        updateLocation(latitude, longitude, accuracy);
      },
      (error) => {
        console.error('[useDriverTracking] Geolocation error:', error);
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização';
            break;
          default:
            errorMessage = 'Erro desconhecido de geolocalização';
            break;
        }
        setState(prev => ({ ...prev, error: errorMessage }));
      },
      {
        enableHighAccuracy: true,
        timeout: options.minIntervalMs * 2,
        maximumAge: options.minIntervalMs,
      }
    );

    setWatchId(id);
  }, [watchId, updateLocation, options.minIntervalMs]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      console.log('[useDriverTracking] Stopping location tracking');
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    setState(prev => ({ ...prev, error: null }));

    if (isTracking && options.trackingEnabled && conductorId) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [
    isTracking,
    options.trackingEnabled,
    conductorId,
    startTracking,
    stopTracking
  ]);

  useEffect(() => {
    console.log('[useDriverTracking] State changed:', state);
  }, [state]);

  return state;
};
