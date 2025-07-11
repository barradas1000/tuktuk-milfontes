import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
import { Coordinates } from "../utils/locationUtils";

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

  // Criar ícone personalizado para o marcador do usuário
  const createUserIcon = (): L.DivIcon => {
    return L.divIcon({
      className: "user-location-marker",
      html: `
        <div class="user-pin">
          <div class="user-pin-dot"></div>
          <div class="user-pin-pulse"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
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

  return (
    <>
      <style jsx>{`
        .user-location-marker {
          background: transparent;
          border: none;
        }

        .user-pin {
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-pin-dot {
          width: 12px;
          height: 12px;
          background: #4facfe;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 2;
          position: relative;
        }

        .user-pin-pulse {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(79, 172, 254, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .user-location-popup {
          text-align: center;
          min-width: 200px;
        }

        .user-location-popup h4 {
          margin: 0 0 0.5rem 0;
          color: #4facfe;
          font-size: 1rem;
        }

        .user-location-popup p {
          margin: 0.25rem 0;
          font-size: 0.85rem;
          color: #666;
        }

        /* Estilo para quando está carregando */
        .user-location-marker.loading .user-pin-dot {
          background: #ffc107;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
};
