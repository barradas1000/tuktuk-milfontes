import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ConductorLocationCardProps {
  conductorId: string;
  conductorName: string;
}

interface DeviceCoords {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

const ConductorLocationCard: React.FC<ConductorLocationCardProps> = ({
  conductorId,
  conductorName,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const [connected, setConnected] = useState(false);
  const [deviceCoords, setDeviceCoords] = useState<DeviceCoords>({
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  useEffect(() => {
    let channel: any;
    async function fetchLocation() {
      const { data, error } = await supabase
        .from("active_conductors")
        .select("current_latitude, current_longitude, accuracy, is_active")
        .eq("conductor_id", conductorId)
        .single();
      if (!error && data && data.is_active) {
        setLocation({
          latitude: data.current_latitude,
          longitude: data.current_longitude,
          accuracy: data.accuracy,
        });
        setConnected(true);
      } else {
        setConnected(false);
        setLocation(null);
      }
    }
    fetchLocation();
    channel = supabase
      .channel(`conductor_location_${conductorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_conductors",
          filter: `conductor_id=eq.${conductorId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.is_active) {
            setLocation({
              latitude: payload.new.current_latitude,
              longitude: payload.new.current_longitude,
              accuracy: payload.new.accuracy,
            });
            setConnected(true);
          } else {
            setConnected(false);
            setLocation(null);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conductorId]);

  // Obter coordenadas reais do dispositivo
  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDeviceCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          setDeviceCoords({ latitude: null, longitude: null, accuracy: null });
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 7000 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle>Localização Atual do Condutor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-semibold text-blue-900 mb-2">{conductorName}</div>
        {connected && location ? (
          <div>
            <div>
              Latitude: <b>{location.latitude}</b>
            </div>
            <div>
              Longitude: <b>{location.longitude}</b>
            </div>
            <div>
              Precisão: <b>{location.accuracy ?? "N/A"} m</b>
            </div>
            <div className="text-green-700 mt-2">
              Conectado ao Supabase e recebendo coordenadas.
            </div>
          </div>
        ) : (
          <div className="text-red-700">
            Condutor não está ativo ou sem localização.
          </div>
        )}
        <div className="mt-4 p-3 bg-white border rounded-lg">
          <div className="font-semibold text-blue-700 mb-1">
            Coordenadas Reais do Dispositivo
          </div>
          {deviceCoords.latitude !== null && deviceCoords.longitude !== null ? (
            <>
              <div>
                Latitude: <b>{deviceCoords.latitude}</b>
              </div>
              <div>
                Longitude: <b>{deviceCoords.longitude}</b>
              </div>
              <div>
                Precisão: <b>{deviceCoords.accuracy ?? "N/A"} m</b>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Essas são as coordenadas que o dispositivo está pronto para
                enviar ao Supabase.
              </div>
            </>
          ) : (
            <div className="text-red-600">
              Não foi possível obter a localização do dispositivo.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConductorLocationCard;
