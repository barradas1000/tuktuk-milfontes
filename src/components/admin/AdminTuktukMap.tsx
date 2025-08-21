import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import tukTukIconUrl from "@/assets/tuktuk-icon.png";
import { RealtimeChannel } from "@supabase/supabase-js";

// Define types for our data
interface ConductorData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: "available" | "busy";
  updatedAt: string | null;
  lastPing: string | null;
  appStatus: string | null;
}

interface ActiveConductorSupabase {
  conductor_id: string;
  name: string;
  current_latitude: number;
  current_longitude: number;
  is_available: boolean;
  updated_at: string;
  last_ping: string | null;
  status: string | null;
}

// Type alias for react-leaflet Marker ref
// The 'any' type is required by the third-party library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkerRef = LeafletMarker<any>;

const TukTukIcon = L.icon({
  iconUrl: tukTukIconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface TukTukMarkerProps {
  position: [number, number];
  conductor: ConductorData;
}

function TukTukMarker({ position, conductor }: TukTukMarkerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<LeafletMarker<any> | null>(null);
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(TukTukIcon);
    }
  }, []);
  return (
    <Marker position={position} ref={markerRef}>
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
          {conductor.lastPing && (
            <p className="text-xs text-gray-500">
              Ping app: {new Date(conductor.lastPing).toLocaleTimeString()}
            </p>
          )}
          {conductor.appStatus && (
            <p className="text-xs text-gray-500">
              Status app: {conductor.appStatus}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

interface MapReadyProps {
  onReady: (map: L.Map) => void;
}

function MapReady({ onReady }: MapReadyProps) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

const AdminTuktukMap: React.FC = () => {
  const [activeConductors, setActiveConductors] = useState<ConductorData[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  // Buscar lista de condutores do painel admin
  const conductors = useMemo(() => window.__ADMIN_CONDUCTORS__ || [], []);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("active_conductors")
        .select(
          "conductor_id, name, current_latitude, current_longitude, is_available, updated_at, last_ping, status"
        )
        .eq("is_active", true);
      if (!error && data) {
        setActiveConductors(
          data
            .filter(
              (d: ActiveConductorSupabase) =>
                typeof d.current_latitude === "number" &&
                typeof d.current_longitude === "number"
            )
            .map((d: ActiveConductorSupabase) => ({
              id: d.conductor_id,
              lat: d.current_latitude,
              lng: d.current_longitude,
              name: d.name || d.conductor_id,
              status: d.is_available ? "available" : "busy",
              updatedAt: d.updated_at,
              lastPing: d.last_ping,
              appStatus: d.status,
            }))
        );
      }
    };
    load();
    
    channelRef.current = supabase
      .channel("admin_active_conductors_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_conductors",
        },
        () => {
          load();
        }
      )
      .subscribe();
      
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conductors]);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    // Set initial view
    map.setView([37.725, -8.783], 14);
  };

  return (
    <div className="w-full h-[400px] my-6 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
      >
        <MapReady onReady={handleMapReady} />
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
