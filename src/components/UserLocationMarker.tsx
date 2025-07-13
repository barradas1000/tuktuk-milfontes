import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
import { Coordinates } from "../utils/locationUtils";
// Importar ícone PNG do usuário
import userIconUrl from "../assets/user-icon.png";

interface UserLocationMarkerProps {
  map: L.Map;
  onPositionChange?: (position: Coordinates) => void;
  onError?: (error: string) => void;
  autoCenter?: boolean;
  showAccuracy?: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  map,
  onPositionChange,
  onError,
  autoCenter = true,
  showAccuracy = true,
}) => {
  const { position, error, isLoading } = useGeolocation();
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  // Criar ícone personalizado para o marcador do usuário usando PNG
  const createUserIcon = (): L.Icon => {
    return L.icon({
      iconUrl: userIconUrl,
      iconSize: [40, 40], // Ajuste conforme o tamanho do seu PNG
      iconAnchor: [20, 20], // Centralizar o ícone
      popupAnchor: [0, -20],
    });
  };

  // Adicionar marcador ao mapa
  const addMarkerToMap = (lat: number, lng: number, accuracy?: number) => {
    // Remover marcador anterior se existir
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
    }

    // Criar novo marcador
    const icon = createUserIcon();
    markerRef.current = L.marker([lat, lng], { icon }).addTo(map);

    // Adicionar popup
    markerRef.current.bindPopup(`
      <div class="user-location-popup">
        <h4>📍 Você está aqui!</h4>
        <p>Latitude: ${lat.toFixed(6)}</p>
        <p>Longitude: ${lng.toFixed(6)}</p>
        ${accuracy ? `<p>Precisão: ±${Math.round(accuracy)}m</p>` : ""}
      </div>
    `);

    // Adicionar círculo de precisão se solicitado
    if (showAccuracy && accuracy) {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: "#4facfe",
        fillColor: "#4facfe",
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(map);
    }

    // Centralizar mapa se solicitado
    if (autoCenter) {
      map.setView([lat, lng], map.getZoom());
    }

    // Callback para mudança de posição
    onPositionChange?.({ lat, lng });
  };

  // Efeito para atualizar marcador quando a posição muda
  useEffect(() => {
    if (position) {
      const { latitude, longitude, accuracy } = position.coords;
      addMarkerToMap(latitude, longitude, accuracy);
    }
  }, [position, map, autoCenter, showAccuracy, onPositionChange]);

  // Efeito para tratar erros
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Limpar marcadores quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
      }
    };
  }, [map]);

  return null;
};
