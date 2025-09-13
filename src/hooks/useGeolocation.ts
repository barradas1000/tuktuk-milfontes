import { useState, useEffect } from "react";

interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  permission: PermissionState | "prompt" | "unsupported";
  isLoading: boolean;
  isSupported: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    permission: "prompt",
    isLoading: true,
    isSupported: false,
  });

  useEffect(() => {
    // Verificar se geolocalização é suportada
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        isLoading: false,
        permission: "unsupported",
      }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Verificar permissão atual
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setState(prev => ({ ...prev, permission: result.state }));

        // Escutar mudanças de permissão
        result.addEventListener("change", () => {
          setState(prev => ({ ...prev, permission: result.state }));
        });
      });
    }

    // Obter posição atual
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutos
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({
          ...prev,
          position,
          error: null,
          isLoading: false,
        }));
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada pelo usuário.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível.";
            break;
          case error.TIMEOUT:
            errorMessage = "Timeout ao obter localização.";
            break;
          default:
            errorMessage = "Erro desconhecido ao obter localização.";
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      },
      options
    );
  }, []);

  return state;
};
