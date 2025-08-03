// Funções utilitárias para datas, bloqueios, tours, etc.

import { format } from "date-fns";
import { BlockedPeriod, AdminReservation } from "./types";

export function getTourDisplayName(
  tourType: string,
  tourTypes: { id: string; name: string }[]
): string {
  const tour = tourTypes.find((t) => t.id === tourType);
  return tour ? tour.name : tourType;
}

export function getDayStatus(
  date: Date,
  inactiveDays: string[],
  getReservationsByDate: (date: string) => AdminReservation[]
): string {
  const dateString = format(date, "yyyy-MM-dd");
  if (inactiveDays.includes(dateString)) return "inactive";
  const reservas = getReservationsByDate(dateString);
  if (reservas.length === 0) return "empty";
  if (reservas.length <= 2) return "low";
  if (reservas.length <= 4) return "medium";
  return "full";
}

// ...adicione outros helpers conforme necessário...
