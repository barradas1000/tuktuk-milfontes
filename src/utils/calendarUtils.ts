import { useEffect } from 'react';
import { generateDynamicTimeSlots } from "@/utils/reservationUtils";
import i18n from "@/i18n/index";

export const timeSlots = generateDynamicTimeSlots();

export const sliderStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export const FALLBACK_CONDUCTORS = [
  {
    id: "condutor1",
    name: "Condutor 1",
    whatsapp: "351963496320",
  },
  {
    id: "condutor2",
    name: "Condutor 2",
    whatsapp: "",
  },
];

export const isValidDate = (date: unknown): date is Date => date instanceof Date && !isNaN(date.getTime());

export const getTourDisplayName = (tourType: string): string => {
  const tourTypes = [
    { id: "panoramic", name: "Passeio panorâmico pela vila" },
    { id: "furnas", name: "Vila Nova de Milfontes → Praia das Furnas" },
    { id: "bridge", name: "Travessia da ponte" },
    { id: "sunset", name: "Pôr do Sol Romântico" },
    { id: "night", name: "Passeio noturno" },
    { id: "fishermen", name: "Rota dos Pescadores" },
  ];
  const tour = tourTypes.find((t) => t.id === tourType);
  return tour ? tour.name : tourType;
};

export const getTourDisplayNameTranslated = (
  tourType: string,
  lang: string
): string => {
  const tourNames: Record<string, Record<string, string>> = {
    pt: {
      panoramic: "Passeio panorâmico pela vila",
      furnas: "Vila Nova de Milfontes → Praia das Furnas",
      bridge: "Travessia da ponte",
      sunset: "Pôr do Sol Romântico",
      night: "Passeio noturno",
      fishermen: "Rota dos Pescadores",
    },
    en: {
      panoramic: "Panoramic tour of the village",
      furnas: "Milfontes → Furnas Beach",
      bridge: "Bridge crossing",
      sunset: "Romantic Sunset",
      night: "Night tour",
      fishermen: "Fishermen's Route",
    },
    es: {
      panoramic: "Paseo panorámico por la villa",
      furnas: "Milfontes → Playa de Furnas",
      bridge: "Cruce del puente",
      sunset: "Puesta de sol romántica",
      night: "Paseo nocturno",
      fishermen: "Ruta de los Pescadores",
    },
    fr: {
      panoramic: "Visite panoramique du village",
      furnas: "Milfontes → Plage des Furnas",
      bridge: "Traversée du pont",
      sunset: "Coucher de soleil romantique",
      night: "Visite nocturne",
      fishermen: "Route des pêcheurs",
    },
    de: {
      panoramic: "Panoramatour durch das Dorf",
      furnas: "Milfontes → Strand von Furnas",
      bridge: "Brückenüberquerung",
      sunset: "Romantischer Sonnenuntergang",
      night: "Nachttour",
      fishermen: "Fischerroute",
    },
    it: {
      panoramic: "Tour panoramico del villaggio",
      furnas: "Milfontes → Spiaggia di Furnas",
      bridge: "Attraversamento del ponte",
      sunset: "Tramonto romantico",
      night: "Tour notturno",
      fishermen: "Rotta dei pescatori",
    },
    nl: {
      panoramic: "Panoramische tour door het dorp",
      furnas: "Milfontes → Furnas-strand",
      bridge: "Brugoversteek",
      sunset: "Romantische zonsondergang",
      night: "Nachttour",
      fishermen: "Vissersroute",
    },
  };
  return tourNames[lang]?.[tourType] || tourNames["pt"][tourType] || tourType;
};

export const interpolateMessage = (
  message: string,
  variables: Record<string, string>
): string => {
  return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
};

export const getClientLanguage = (reservation: { language?: string | null }): string => {
  if (reservation.language && i18n.languages.includes(reservation.language)) {
    return reservation.language;
  }
  return "pt";
};

export const getTranslatedMessage = (
  reservation: { language?: string | null },
  messageKey: string,
  variables: Record<string, string>
): string => {
  const clientLanguage = getClientLanguage(reservation);
  const currentLanguage = i18n.language;
  i18n.changeLanguage(clientLanguage);
  const template = i18n.t(`reservation.whatsappMessages.${messageKey}`);
  i18n.changeLanguage(currentLanguage);
  return interpolateMessage(template, variables);
};

export const getWhatsappLink = (phone: string, message: string) => {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.substring(1);
  }
  if (!cleanPhone.startsWith("351")) {
    cleanPhone = "351" + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export function useSyncActiveConductors(fetchActiveConductors: () => Promise<unknown>, setActiveConductors: (conductors: unknown) => void) {
  useEffect(() => {
    function handleStatusChanged() {
      fetchActiveConductors().then(setActiveConductors);
    }
    window.addEventListener("conductorStatusChanged", handleStatusChanged);
    return () => {
      window.removeEventListener("conductorStatusChanged", handleStatusChanged);
    };
  }, [fetchActiveConductors, setActiveConductors]);
}
