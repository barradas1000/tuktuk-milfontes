import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Radio, Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConductorLocationCardProps {
  conductorId: string;
  conductorName: string;
  onStartTracking?: () => void;
  onStopTracking?: () => void;
}

interface LocationStatus {
  status: 'green' | 'yellow' | 'red';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  lastUpdate?: Date;
  error?: string;
}

const ConductorLocationCard: React.FC<ConductorLocationCardProps> = ({
  conductorId,
  conductorName,
  onStartTracking,
  onStopTracking,
}) => {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    status: 'red',
    error: 'Carregando localização...'
  });
  const [isTracking, setIsTracking] = useState(false);
  const [lastTrackingTime, setLastTrackingTime] = useState<Date | null>(null);

  useEffect(() => {
    // Simular verificação de localização
    const checkLocation = async () => {
      try {
        // Simulação - em produção isso viria do Supabase ou API de GPS
        const hasLocation = Math.random() > 0.3; // 70% chance de ter localização

        if (hasLocation) {
          setLocationStatus({
            status: 'green',
            latitude: 37.1075 + (Math.random() - 0.5) * 0.01,
            longitude: -8.6844 + (Math.random() - 0.5) * 0.01,
            accuracy: Math.floor(Math.random() * 100) + 10,
            lastUpdate: new Date()
          });
        } else {
          setLocationStatus({
            status: 'red',
            error: 'Localização não disponível',
            lastUpdate: new Date()
          });
        }
      } catch (error) {
        setLocationStatus({
          status: 'red',
          error: 'Erro ao obter localização',
          lastUpdate: new Date()
        });
      }
    };

    const interval = setInterval(checkLocation, 10000); // Atualizar a cada 10 segundos
    checkLocation(); // Verificação inicial

    return () => clearInterval(interval);
  }, [conductorId]);

  const handleStartTracking = async () => {
    setIsTracking(true);
    setLastTrackingTime(new Date());

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (onStartTracking) {
      onStartTracking();
    }
  };

  const handleStopTracking = async () => {
    setIsTracking(false);
    if (onStopTracking) {
      onStopTracking();
    }
  };

  const getStatusIcon = () => {
    switch (locationStatus.status) {
      case 'green':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'yellow':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'red':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (locationStatus.status) {
      case 'green':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'red':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (locationStatus.status) {
      case 'green':
        return 'Localização Ativa';
      case 'yellow':
        return 'Tentando Obter Localização';
      case 'red':
        return locationStatus.error || 'Sem Localização';
      default:
        return 'Status Desconhecido';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Localização do TukTuk
          </span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status da Localização */}
        <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <strong className="text-sm">{conductorName}</strong>
            <Badge variant="secondary" className="text-xs">
              ID: {conductorId}
            </Badge>
          </div>

          <div className="text-sm mb-2">
            {getStatusLabel()}
          </div>

          {locationStatus.status === 'green' && locationStatus.latitude && (
            <div className="text-xs text-gray-600 space-y-1">
              <div>📍 Lat: {locationStatus.latitude.toFixed(6)}</div>
              <div>📍 Lon: {locationStatus.longitude!.toFixed(6)}</div>
              <div>🎯 Precisão: ±{locationStatus.accuracy}m</div>
              {locationStatus.lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Clock className="w-3 h-3" />
                  Atualizado às {locationStatus.lastUpdate.toLocaleTimeString('pt-PT')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controles de Rastreamento */}
        {!isTracking ? (
          <Button
            onClick={handleStartTracking}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={locationStatus.status === 'red'}
          >
            <Radio className="w-4 h-4 mr-2" />
            Iniciar Rastreamento GPS
          </Button>
        ) : (
          <Button
            onClick={handleStopTracking}
            variant="destructive"
            className="w-full"
          >
            <Radio className="w-4 h-4 mr-2" />
            Parar Rastreamento
          </Button>
        )}

        {/* Status de Rastreamento */}
        {isTracking && lastTrackingTime && (
          <Alert>
            <Radio className="h-4 w-4" />
            <AlertDescription>
              <strong>Rastreamento ativo!</strong>
              <br />
              Iniciado em {lastTrackingTime.toLocaleTimeString('pt-PT')}
            </AlertDescription>
          </Alert>
        )}

        {/* Última atualização */}
        {locationStatus.lastUpdate && !locationStatus.error && (
          <div className="text-xs text-center text-gray-500">
            Última verificação: {locationStatus.lastUpdate.toLocaleTimeString('pt-PT')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConductorLocationCard;
