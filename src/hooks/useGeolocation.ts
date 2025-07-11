import { useState, useCallback, useEffect } from 'react';

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export type PermissionStatus = 'granted' | 'denied' | 'prompt';

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionStatus>('prompt');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o navegador suporta geolocalização
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Verificar permissão atual
  const checkPermission = useCallback(async () => {
    if (!isSupported) {
      setPermission('denied');
      return;
    }

    try {
      // Para navegadores que suportam Permissions API
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermission(result.state as PermissionStatus);
        
        result.addEventListener('change', () => {
          setPermission(result.state as PermissionStatus);
        });
      } else {
        setPermission('prompt');
      }
    } catch (err) {
      setPermission('prompt');
    }
  }, [isSupported]);

  // Obter localização atual
  const getLocation = useCallback((options?: PositionOptions) => {
    if (!isSupported) {
      setError('Geolocalização não é suportada neste navegador');
      return;
    }

    setIsLoading(true);
    setError(null);

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setPermission('granted');
        setIsLoading(false);
      },
      (err: GeolocationPositionError) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            setPermission('denied');
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Informação de localização indisponível';
            break;
          case err.TIMEOUT:
            errorMessage = 'Tempo limite excedido ao obter localização';
            break;
          default:
            errorMessage = err.message || 'Erro desconhecido';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      defaultOptions
    );
  }, [isSupported]);

  // Observar mudanças de posição
  const watchPosition = useCallback((options?: PositionOptions) => {
    if (!isSupported) {
      setError('Geolocalização não é suportada neste navegador');
      return null;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    };

    return navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        setPermission('granted');
      },
      (err: GeolocationPositionError) => {
        let errorMessage = 'Erro ao monitorar localização';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            setPermission('denied');
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Informação de localização indisponível';
            break;
          case err.TIMEOUT:
            errorMessage = 'Tempo limite excedido ao obter localização';
            break;
          default:
            errorMessage = err.message || 'Erro desconhecido';
        }
        
        setError(errorMessage);
      },
      defaultOptions
    );
  }, [isSupported]);

  // Limpar posição
  const clearPosition = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  // Verificar permissão na inicialização
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    position,
    error,
    permission,
    isLoading,
    isSupported,
    getLocation,
    watchPosition,
    clearPosition,
    checkPermission
  };
}; 