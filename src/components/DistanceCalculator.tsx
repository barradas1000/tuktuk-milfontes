import React, { useCallback, useEffect, useState } from "react";
import {
  Coordinates,
  calculateDistanceAndTime,
  formatDistance,
  formatEstimatedTime,
} from "../utils/locationUtils";

const VELOCIDADE_MEDIA_KMH = 15; // ✅ Corrigir de 30 para 15 km/h

interface DistanceCalculatorProps {
  userPosition: Coordinates | null;
  tuktukPosition: Coordinates | null;
  className?: string;
  showDetails?: boolean;
  updateInterval?: number; // em milissegundos
}

export const DistanceCalculator: React.FC<DistanceCalculatorProps> = ({
  userPosition,
  tuktukPosition,
  className = "",
  showDetails = false,
  updateInterval = 5000, // atualiza a cada 5 segundos
}) => {
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    distanceKm: number;
    estimatedTime: number;
  } | null>(null);

  const [isNearby, setIsNearby] = useState(false);

  // Calcular distância e tempo estimado
  const calculateDistance = useCallback(() => {
    if (!userPosition || !tuktukPosition) return null;

    // Fórmula de Haversine para calcular distância
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Raio da Terra em km

    const dLat = toRad(tuktukPosition.lat - userPosition.lat);
    const dLng = toRad(tuktukPosition.lng - userPosition.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userPosition.lat)) *
        Math.cos(toRad(tuktukPosition.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // ✅ Calcular tempo estimado com velocidade de 15 km/h
    const tempoEstimadoMinutos = (distanceKm / VELOCIDADE_MEDIA_KMH) * 60;

    return {
      distanceKm,
      distanceMeters: distanceKm * 1000,
      tempoEstimadoMinutos: Math.round(tempoEstimadoMinutos),
    };
  }, [userPosition, tuktukPosition]);

  // Atualizar cálculo periodicamente
  useEffect(() => {
    const result = calculateDistance();

    if (!result) {
      setDistanceInfo(null);
      setIsNearby(false);
      return;
    }

    setDistanceInfo(result);

    // Verificar se está próximo (menos de 100m)
    setIsNearby(result.distance <= 100);
  }, [calculateDistance, updateInterval]);

  // Efeito para alerta de proximidade
  useEffect(() => {
    if (isNearby && userPosition && tuktukPosition) {
      // Mostrar notificação se o navegador suportar
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚖 Seu tuk-tuk chegou!", {
          body: "O tuk-tuk está a menos de 100m de você!",
          icon: "/favicon.ico",
          tag: "tuktuk-nearby",
        });
      }
    }
  }, [isNearby, userPosition, tuktukPosition]);

  if (!userPosition || !tuktukPosition) {
    return (
      <div className={`distance-calculator ${className}`}>
        <div className="distance-status">
          <span className="status-icon">📍</span>
          <span className="status-text">Aguardando localização...</span>
        </div>
      </div>
    );
  }

  if (!distanceInfo) {
    return (
      <div className={`distance-calculator ${className}`}>
        <div className="distance-status">
          <span className="status-icon">⚠️</span>
          <span className="status-text">Erro ao calcular distância</span>
        </div>
      </div>
    );
  }

  const { distanceKm, distanceMeters, tempoEstimadoMinutos } = distanceInfo;

  if (!showDetails) {
    return (
      <div className="bg-white rounded-lg shadow-md p-2 text-sm">
        <p className="font-medium">
          {distanceKm < 1
            ? `${Math.round(distanceMeters)}m`
            : `${distanceKm.toFixed(1)}km`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 text-sm max-w-xs">
      <div className="space-y-2">
        <div>
          <p className="font-medium text-gray-700">Distância:</p>
          <p className="text-blue-600 font-semibold">
            {distanceKm < 1
              ? `${Math.round(distanceMeters)} metros`
              : `${distanceKm.toFixed(1)} km`}
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-700">Tempo estimado:</p>
          <p className="text-green-600 font-semibold">
            {tempoEstimadoMinutos < 1
              ? "< 1 minuto"
              : `${tempoEstimadoMinutos} min`}
          </p>
        </div>

        <div className="text-xs text-gray-500 border-t pt-2">
          <p>Velocidade média: {VELOCIDADE_MEDIA_KMH} km/h</p>{" "}
          {/* ✅ Mostra 15 km/h */}
        </div>
      </div>
    </div>
  );
};
