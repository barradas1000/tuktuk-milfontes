import React from 'react';
import { LocationPoint } from '@/types/history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Gauge } from 'lucide-react';

interface TripSummaryProps {
  points: LocationPoint[];
}

// Função auxiliar para calcular distância Haversine
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}

export const TripSummary: React.FC<TripSummaryProps> = ({ points }) => {
  if (points.length < 2) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center">Dados insuficientes para calcular estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular distância total
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const current = points[i];
    totalDistance += haversineDistance(
      prev.latitude,
      prev.longitude,
      current.latitude,
      current.longitude
    );
  }

  // Calcular duração
  const startTime = new Date(points[0].timestamp);
  const endTime = new Date(points[points.length - 1].timestamp);
  const duration = (endTime.getTime() - startTime.getTime()) / 1000; // segundos

  // Calcular velocidade média (km/h)
  const averageSpeed = duration > 0 ? (totalDistance / (duration / 3600)) : 0;

  // Formatar duração
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Distância Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distância Total</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDistance.toFixed(2)} km</div>
        </CardContent>
      </Card>

      {/* Duração */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duração</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(duration)}</div>
        </CardContent>
      </Card>

      {/* Velocidade Média */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Velocidade Média</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageSpeed.toFixed(1)} km/h</div>
        </CardContent>
      </Card>
    </div>
  );
};
