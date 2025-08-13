import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import tukTukIconUrl from "@/assets/tuktuk-icon.png";

const TukTukIcon = L.icon({
  iconUrl: tukTukIconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function TukTukMarker({ position, conductor }) {
  const markerRef = useRef<LeafletMarker | null>(null);
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(TukTukIcon);
    }
  }, []);
  return (
    <Marker position={position} ref={markerRef as any}>
      <Popup>
        <div className="text-center">
          <h3 className="font-bold text-blue-600">{conductor.name}</h3>
          <p className="text-sm text-gray-600">
            {conductor.status === "available" ? "Disponível" : "Ocupado"}
          </p>
          <p className="text-xs text-gray-500">
            Última atualização:{" "}
            {new Date(conductor.updatedAt ?? "").toLocaleTimeString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

const AdminTuktukMap: React.FC = () => {
  const [activeConductors, setActiveConductors] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  // Buscar lista de condutores do painel admin
  const conductors = window.__ADMIN_CONDUCTORS__ || [];

  useEffect(() => {
    let channel: any = null;
    const load = async () => {
      const { data, error } = await supabase
        .from("active_conductors")
        .select(
          "conductor_id, name, current_latitude, current_longitude, is_available, updated_at"
        )
        .eq("is_active", true);
      if (!error && data) {
        setActiveConductors(
          data
            .filter(
              (d: any) =>
                typeof d.current_latitude === "number" &&
                typeof d.current_longitude === "number"
            )
            .map((d: any) => ({
              id: d.conductor_id,
              lat: d.current_latitude,
              lng: d.current_longitude,
              name: d.name || d.conductor_id,
              status: d.is_available ? "available" : "busy",
              updatedAt: d.updated_at,
            }))
        );
      }
    };
    load();
    channel = supabase
      .channel("admin_active_conductors_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_conductors",
        },
        (payload: any) => {
          load();
        }
      )
      .subscribe();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conductors]);

  return (
    <div className="w-full h-[400px] my-6 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[37.725, -8.783]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {activeConductors.map((conductor) => (
          <TukTukMarker
            key={conductor.id}
            position={[conductor.lat, conductor.lng]}
            conductor={conductor}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default AdminTuktukMap;
