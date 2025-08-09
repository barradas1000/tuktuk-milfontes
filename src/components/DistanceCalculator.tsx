import React, { useCallback, useEffect, useState } from "react";
import {
  Coordinates,
  calculateDistanceAndTime,
  formatDistance,
  formatEstimatedTime,
} from "../utils/locationUtils";

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
  showDetails = true,
  updateInterval = 5000,
}) => {
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    distanceKm: number;
    estimatedTime: number;
  } | null>(null);

  const [isNearby, setIsNearby] = useState(false);

  const runCalculation = useCallback(() => {
    if (!userPosition || !tuktukPosition) {
      setDistanceInfo(null);
      setIsNearby(false);
      return;
    }

    const result = calculateDistanceAndTime(userPosition, tuktukPosition);
    setDistanceInfo(result);
    setIsNearby(result.distance <= 100);
  }, [userPosition, tuktukPosition]);

  useEffect(() => {
    runCalculation();
    const interval = setInterval(runCalculation, updateInterval);
    return () => clearInterval(interval);
  }, [runCalculation, updateInterval]);

  useEffect(() => {
    if (isNearby && userPosition && tuktukPosition) {
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
      <div className={`bg-white rounded-lg shadow-md p-3 text-sm ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-lg">📍</span>
          <span>Aguardando localização...</span>
        </div>
      </div>
    );
  }

  if (!distanceInfo) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-3 text-sm ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <span className="text-lg">⚠️</span>
          <span>Erro ao calcular distância</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-3 text-sm max-w-xs ${
        isNearby ? "ring-2 ring-green-500 bg-green-50" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl">{isNearby ? "🚖" : "📍"}</div>
        <div className="flex-1">
          <div className="text-xl font-bold text-gray-800 leading-none">
            {formatDistance(distanceInfo.distance)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {isNearby ? "Tuk-tuk próximo!" : "Distância até o tuk-tuk"}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Tempo estimado:</span>
            <span className="font-semibold text-gray-800">
              {formatEstimatedTime(distanceInfo.estimatedTime)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Velocidade média:</span>
            <span className="font-semibold text-gray-800">30 km/h</span>
          </div>
        </div>
      )}
    </div>
  );
};
