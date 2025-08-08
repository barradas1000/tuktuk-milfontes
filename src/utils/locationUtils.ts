export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distance: number; // em metros
  distanceKm: number; // em quilômetros
  estimatedTime: number; // tempo estimado em minutos
}

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * @param lat1 Latitude do primeiro ponto
 * @param lon1 Longitude do primeiro ponto
 * @param lat2 Latitude do segundo ponto
 * @param lon2 Longitude do segundo ponto
 * @returns Distância em metros
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
};

/**
 * Calcula distância e tempo estimado entre duas coordenadas
 * @param point1 Primeira coordenada
 * @param point2 Segunda coordenada
 * @param averageSpeed Velocidade média em km/h (padrão: 30 km/h para tuk-tuk)
 * @returns Objeto com distância e tempo estimado
 */
export const calculateDistanceAndTime = (
  point1: Coordinates,
  point2: Coordinates,
  averageSpeed: number = 30
): DistanceResult => {
  const distance = calculateDistance(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  );
  const distanceKm = distance / 1000;
  const estimatedTime = (distanceKm / averageSpeed) * 60; // tempo em minutos

  return {
    distance,
    distanceKm,
    estimatedTime: Math.round(estimatedTime),
  };
};

/**
 * Formata distância para exibição
 * @param distance Distância em metros
 * @returns String formatada
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Formata tempo estimado para exibição
 * @param minutes Tempo em minutos
 * @returns String formatada
 */
export const formatEstimatedTime = (minutes: number): string => {
  if (minutes < 1) {
    return "Menos de 1 min";
  } else if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }
};

/**
 * Valida se as coordenadas são válidas
 * @param lat Latitude
 * @param lng Longitude
 * @returns true se as coordenadas são válidas
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Verifica se duas coordenadas são próximas (dentro de uma distância específica)
 * @param point1 Primeira coordenada
 * @param point2 Segunda coordenada
 * @param maxDistance Distância máxima em metros (padrão: 100m)
 * @returns true se as coordenadas estão próximas
 */
export const isNearby = (
  point1: Coordinates,
  point2: Coordinates,
  maxDistance: number = 100
): boolean => {
  const distance = calculateDistance(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  );
  return distance <= maxDistance;
};

/**
 * Converte graus decimais para graus, minutos e segundos
 * @param decimal Graus decimais
 * @returns String formatada
 */
export const decimalToDMS = (decimal: number): string => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  return `${degrees}° ${minutes}' ${seconds}"`;
};

/**
 * Converte coordenadas para formato legível
 * @param lat Latitude
 * @param lng Longitude
 * @returns String formatada
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  const latStr = decimalToDMS(lat);
  const lngStr = decimalToDMS(lng);
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";

  return `${latStr} ${latDir}, ${lngStr} ${lngDir}`;
};

/**
 * Calcula o ponto médio entre duas coordenadas
 * @param point1 Primeira coordenada
 * @param point2 Segunda coordenada
 * @returns Coordenada do ponto médio
 */
export const getMidpoint = (
  point1: Coordinates,
  point2: Coordinates
): Coordinates => {
  return {
    lat: (point1.lat + point2.lat) / 2,
    lng: (point1.lng + point2.lng) / 2,
  };
};

/**
 * Calcula o zoom ideal para mostrar duas coordenadas no mapa
 * @param point1 Primeira coordenada
 * @param point2 Segunda coordenada
 * @param mapWidth Largura do mapa em pixels
 * @param mapHeight Altura do mapa em pixels
 * @returns Nível de zoom ideal
 */
export const calculateOptimalZoom = (
  point1: Coordinates,
  point2: Coordinates,
  mapWidth: number = 800,
  mapHeight: number = 600
): number => {
  const distance = calculateDistance(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  );
  const distanceKm = distance / 1000;

  // Fórmula aproximada para calcular zoom baseado na distância
  if (distanceKm < 0.1) return 18; // Muito próximo
  if (distanceKm < 0.5) return 16; // Próximo
  if (distanceKm < 2) return 14; // Médio
  if (distanceKm < 10) return 12; // Longe
  if (distanceKm < 50) return 10; // Muito longe
  return 8; // Extremamente longe
};
