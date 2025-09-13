// src/data/tourTypes.ts
export type TourType = {
  id: string;
  /** chave i18n (usar em componentes: t(tour.titleKey)) */
  titleKey: string;
  price: number; // euros
  duration: number; // minutos
  capacity?: number; // opcional: capacidade do tuktuk / grupo
  descriptionKey?: string;
};

export const tourTypes: TourType[] = [
  { id: "panoramic", titleKey: "tours.panoramic.title", price: 10, duration: 45, capacity: 6 },
  { id: "furnas", titleKey: "tours.furnas.title", price: 14, duration: 60, capacity: 6 },
  { id: "bridge", titleKey: "tours.bridge.title", price: 10, duration: 45, capacity: 6 },
  { id: "sunset", titleKey: "tours.sunset.title", price: 25, duration: 90, capacity: 6 },
  { id: "night", titleKey: "tours.night.title", price: 8, duration: 35, capacity: 6 },
  { id: "fishermen", titleKey: "tours.fishermen.title", price: 10, duration: 45, capacity: 6 },
];

export default tourTypes;
