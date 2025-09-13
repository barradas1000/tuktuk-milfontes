import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LocationPoint } from '@/types/history';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  points: LocationPoint[];
}

// Componente para ajustar a view do mapa
const MapBounds: React.FC<{ points: LocationPoint[] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(
        points.map(point => [point.latitude, point.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, points]);

  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ points }) => {
  if (points.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Nenhum dado de rota disponível</p>
      </div>
    );
  }

  const routeCoordinates = points.map(point => [point.latitude, point.longitude]);
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[startPoint.latitude, startPoint.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Polyline
          positions={routeCoordinates}
          color="#3b82f6"
          weight={4}
          opacity={0.7}
        />
        
        {/* Marcador de início */}
        <Marker position={[startPoint.latitude, startPoint.longitude]}>
          <Popup>
            <div className="text-sm">
              <strong>Início</strong><br />
              {new Date(startPoint.timestamp).toLocaleString('pt-PT')}
            </div>
          </Popup>
        </Marker>

        {/* Marcador de fim */}
        <Marker position={[endPoint.latitude, endPoint.longitude]}>
          <Popup>
            <div className="text-sm">
              <strong>Fim</strong><br />
              {new Date(endPoint.timestamp).toLocaleString('pt-PT')}
            </div>
          </Popup>
        </Marker>

        <MapBounds points={points} />
      </MapContainer>
    </div>
  );
};
