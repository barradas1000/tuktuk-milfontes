import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MilfontesLeafletMap from "@/components/MilfontesLeafletMap";

interface TuktukLocation {
  id: string;
  conductorName: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy' | 'offline';
  lastUpdate: Date;
  accuracy?: number;
}

interface AdminTuktukMapProps {
  refreshInterval?: number; // em segundos
  showControls?: boolean;
}

const AdminTuktukMap: React.FC<AdminTuktukMapProps> = ({
  refreshInterval = 30,
  showControls = true
}) => {
  const [tuktuks, setTuktuks] = useState<TuktukLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [mapCenter] = useState({
    lat: 37.1075,
    lng: -8.6844
  });

  // Simular dados de TukTuks - em produção viria do Supabase
  useEffect(() => {
    const generateSampleTuktuks = () => {
      const sampleTuktuks: TuktukLocation[] = [
        {
          id: 'tuktuk-1',
          conductorName: 'Carlos Barradas',
          latitude: 37.1075 + (Math.random() - 0.5) * 0.01,
          longitude: -8.6844 + (Math.random() - 0.5) * 0.01,
          status: 'available',
          lastUpdate: new Date(),
          accuracy: Math.floor(Math.random() * 50) + 10
        },
        {
          id: 'tuktuk-2',
          conductorName: 'Sónia Carias',
          latitude: 37.1075 + (Math.random() - 0.5) * 0.01,
          longitude: -8.6844 + (Math.random() - 0.5) * 0.01,
          status: 'busy',
          lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 300000)), // até 5 minutos atrás
          accuracy: Math.floor(Math.random() * 50) + 10
        },
        {
          id: 'tuktuk-3',
          conductorName: 'Diogo Carias',
          latitude: 37.1075 + (Math.random() - 0.5) * 0.01,
          longitude: -8.6844 + (Math.random() - 0.5) * 0.01,
          status: Math.random() > 0.7 ? 'offline' : 'available',
          lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 600000)), // até 10 minutos atrás
          accuracy: Math.floor(Math.random() * 50) + 10
        }
      ];

      setTuktuks(sampleTuktuks);
      setLoading(false);
    };

    generateSampleTuktuks();

    // Atualização automática
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      generateSampleTuktuks();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshMapData = () => {
    setLastRefresh(new Date());
    setLoading(true);

    // Simular refresh
    setTimeout(() => {
      const sampleTuktuks: TuktukLocation[] = [
        {
          id: 'tuktuk-1',
          conductorName: 'Carlos Barradas',
          latitude: 37.1075 + (Math.random() - 0.5) * 0.01,
          longitude: -8.6844 + (Math.random() - 0.5) * 0.01,
          status: 'available',
          lastUpdate: new Date(),
          accuracy: Math.floor(Math.random() * 50) + 10
        },
        {
          id: 'tuktuk-2',
          conductorName: 'Sónia Carias',
          latitude: 37.1075 + (Math.random() - 0.5) * 0.01,
          longitude: -8.6844 + (Math.random() - 0.5) * 0.01,
          status: 'busy',
          lastUpdate: new Date(),
          accuracy: Math.floor(Math.random() * 50) + 10
        }
      ];

      setTuktuks(sampleTuktuks);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'busy':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'offline':
        return 'bg-gray-100 border-gray-300 text-gray-600';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '🟢';
      case 'busy':
        return '🟠';
      case 'offline':
        return '⚫';
      default:
        return '⚫';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'busy':
        return 'Ocupado';
      case 'offline':
        return 'Offline';
      default:
        return 'Desconhecido';
    }
  };

  // Conteúdos para os marcadores do mapa
  const mapMarkers = tuktuks.map(tuktuk => ({
    position: [tuktuk.latitude, tuktuk.longitude] as [number, number],
    popupContent: (
      <div className="text-sm">
        <div className="font-bold">{tuktuk.conductorName}</div>
        <div className="flex items-center gap-2 mt-1">
          <span>{getStatusIcon(tuktuk.status)}</span>
          <span>{getStatusLabel(tuktuk.status)}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Atualizado às {tuktuk.lastUpdate.toLocaleTimeString('pt-PT')}
        </div>
        {tuktuk.accuracy && (
          <div className="text-xs text-gray-500">
            Precisão: ±{tuktuk.accuracy}m
          </div>
        )}
      </div>
    ),
    iconType: tuktuk.status as 'available' | 'busy' | 'offline'
  }));

  return (
    <Card className="w-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            TukTuks em Tempo Real
          </span>
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshMapData}
                size="sm"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Última atualização: {lastRefresh.toLocaleTimeString('pt-PT')}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {tuktuks.filter(t => t.status === 'available').length}
            </div>
            <div className="text-xs text-green-800">Disponíveis</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {tuktuks.filter(t => t.status === 'busy').length}
            </div>
            <div className="text-xs text-orange-800">Ocupados</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {tuktuks.filter(t => t.status === 'offline').length}
            </div>
            <div className="text-xs text-gray-800">Offline</div>
          </div>
        </div>

        {/* Map - Placeholder para desenvolvimento futuro com marcadores customizados */}
        <div className="h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Mapa em Desenvolvimento
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Funcionalidade avançada de marcadores customizados será implementada.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div>📍 Marcadores dinâmicos por status</div>
              <div>🔄 Atualização em tempo real</div>
              <div>🎯 Precisão de localização</div>
            </div>
          </div>
        </div>

        {/* Lista de TukTuks */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Lista de TukTuks ({tuktuks.length})
          </h4>

          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Carregando...</p>
            </div>
          ) : tuktuks.length === 0 ? (
            <div className="text-center py-4">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhum TukTuk ativo encontrado</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tuktuks.map(tuktuk => (
                <div
                  key={tuktuk.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {tuktuk.conductorName}
                    </div>
                    <div className="text-xs text-gray-600">
                      ID: {tuktuk.id} • Prec: ±{tuktuk.accuracy}m
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(tuktuk.status)}>
                      {getStatusIcon(tuktuk.status)} {getStatusLabel(tuktuk.status)}
                    </Badge>
                    <div className="text-xs text-gray-500 w-16">
                      {tuktuk.lastUpdate.toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTuktukMap;
