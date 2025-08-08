<<<<<<< HEAD
import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
=======
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
import { Coordinates } from "../utils/locationUtils";
// Importar ícone PNG do usuário
import userIconUrl from "../assets/user-icon.png";

interface UserLocationMarkerProps {
  map: L.Map;
<<<<<<< HEAD
  userPosition: Coordinates | null;
  accuracy?: number;
=======
  onPositionChange?: (position: Coordinates) => void;
  onError?: (error: string) => void;
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
  autoCenter?: boolean;
  showAccuracy?: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  map,
<<<<<<< HEAD
  userPosition,
  accuracy,
  autoCenter = true,
  showAccuracy = true,
}) => {
=======
  onPositionChange,
  onError,
  autoCenter = true,
  showAccuracy = true,
}) => {
  const { position, error, isLoading } = useGeolocation();
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  // Criar ícone personalizado para o marcador do usuário usando PNG
  const createUserIcon = (): L.Icon => {
    return L.icon({
      iconUrl: userIconUrl,
<<<<<<< HEAD
      iconSize: [60, 60], // Ajuste conforme o tamanho do seu PNG
      iconAnchor: [30, 30], // Centralizar o ícone
      popupAnchor: [0, -10],
=======
      iconSize: [40, 40], // Ajuste conforme o tamanho do seu PNG
      iconAnchor: [20, 20], // Centralizar o ícone
      popupAnchor: [0, -20],
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
    });
  };

  // Adicionar marcador ao mapa
<<<<<<< HEAD
  const addMarkerToMap = useCallback(
    (lat: number, lng: number, acc?: number) => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
      }
      const icon = createUserIcon();
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      markerRef.current.bindPopup(`
=======
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
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
      <div class="user-location-popup">
        <h4>📍 Você está aqui!</h4>
        <p>Latitude: ${lat.toFixed(6)}</p>
        <p>Longitude: ${lng.toFixed(6)}</p>
<<<<<<< HEAD
        ${acc ? `<p>Precisão: ±${Math.round(acc)}m</p>` : ""}
      </div>
    `);
      if (showAccuracy && acc) {
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius: acc,
          color: "#4facfe",
          fillColor: "#4facfe",
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(map);
      }
      if (autoCenter) {
        map.setView([lat, lng], map.getZoom());
      }
    },
    [map, autoCenter, showAccuracy]
  );

  // Efeito para atualizar marcador quando a posição muda
  useEffect(() => {
    if (userPosition) {
      addMarkerToMap(userPosition.lat, userPosition.lng, accuracy);
    }
  }, [userPosition, accuracy, addMarkerToMap]);

  // (Removido: não há mais error/onError neste componente)
=======
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
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363

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
