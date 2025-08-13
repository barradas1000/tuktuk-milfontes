import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ConductorLocationCardProps {
  conductorId: string;
  conductorName: string;
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
      </CardContent>
    </Card>
  );
};

export default ConductorLocationCard;
