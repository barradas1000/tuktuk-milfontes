// src/components/admin/AdminCalendar/helpers.tsx
import React from "react";
import { Badge } from "@/components/ui/badge"; // ajuste conforme seu caminho real
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { AdminReservation } from "@/types/adminReservations";

export type StatusVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Retorna o componente Badge correto para cada status de reserva
 */
export const getStatusBadge = (status: string) => {
  let variant: StatusVariant = "default";
  let Icon: React.ElementType | null = null;
  let text = status.charAt(0).toUpperCase() + status.slice(1);

  switch (status) {
    case "confirmed":
      variant = "secondary";
      Icon = CheckCircle;
      text = "Confirmada";
      break;
    case "cancelled":
      variant = "destructive";
      Icon = XCircle;
      text = "Cancelada";
      break;
    case "pending":
      variant = "outline";
      Icon = AlertCircle;
      text = "Pendente";
      break;
  }

  return (
    <Badge variant={variant}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {text}
    </Badge>
  );
};

/**
 * Formata a data para exibir no formato pt-BR
 */
export const formatDate = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Função auxiliar para transformar horários em slots (exemplo)
 */
export const generateTimeSlots = (startHour: number, endHour: number, interval = 30) => {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hourStr = h.toString().padStart(2, "0");
      const minStr = m.toString().padStart(2, "0");
      slots.push(`${hourStr}:${minStr}`);
    }
  }
  return slots;
};

/**
 * Retorna o nome de exibição para um tipo de tour em português
 */
export const getTourDisplayName = (tourType: string | undefined): string => {
  if (!tourType) return "Tour não especificado";

  const tourNames: Record<string, string> = {
    panoramic: "Tour Panorâmico",
    furnas: "Tour das Furnas",
    bridge: "Tour da Ponte",
    sunset: "Tour do Pôr do Sol",
    night: "Tour Noturno",
    fishermen: "Tour dos Pescadores",
  };

  return tourNames[tourType] || tourType.charAt(0).toUpperCase() + tourType.slice(1);
};

/**
 * Determina o idioma do cliente baseado na reserva
 */
export const getClientLanguage = (reservation: AdminReservation): string => {
  // Verificar se a reserva possui propriedade de idioma
  if (reservation.language) {
    return reservation.language === 'pt' ? 'Português' : reservation.language;
  }

  // Fallback baseado no email ou outros indicadores
  if (reservation.customer_email && reservation.customer_email.includes('.pt')) {
    return 'Português';
  }

  // Default para português
  return 'Português';
};
