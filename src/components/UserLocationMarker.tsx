import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { Coordinates } from "../utils/locationUtils";
// Importar ícone PNG do usuário
import userIconUrl from "../assets/user-icon.png";

interface UserLocationMarkerProps {
  map: L.Map;
  userPosition: Coordinates | null;
  accuracy?: number;
  autoCenter?: boolean;
  showAccuracy?: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  map,
  userPosition,
  accuracy,
  autoCenter = true,
  showAccuracy = true,
}) => {
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  // Criar ícone personalizado para o marcador do usuário usando PNG
  const createUserIcon = (): L.Icon => {
    return L.icon({
      iconUrl: userIconUrl,
      iconSize: [60, 60], // Ajuste conforme o tamanho do seu PNG
      iconAnchor: [30, 30], // Centralizar o ícone
      popupAnchor: [0, -10],
    });
  };

  // Adicionar marcador ao mapa
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
      <div class="user-location-popup">
        <h4>📍 Você está aqui!</h4>
        <p>Latitude: ${lat.toFixed(6)}</p>
        <p>Longitude: ${lng.toFixed(6)}</p>
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
