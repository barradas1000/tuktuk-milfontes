// CSS personalizado para esconder scrollbar e otimizações mobile
export const sliderStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Otimizações para slots em mobile */
  @media (max-width: 475px) {
    .grid-mobile-optimized {
      gap: 0.4rem;
      padding: 0.4rem;
    }
    
    .slot-mobile {
      min-height: 6rem;
      font-size: 0.85rem;
      padding: 0.4rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease-in-out;
      border-width: 1px;
    }
    
    .slot-mobile:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .slot-mobile .slot-time {
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.3;
      color: #1f2937;
      margin-bottom: 0.2rem;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.8rem;
      line-height: 1.3;
      margin-top: 0.2rem;
      max-width: 100%;
      overflow: visible;
      text-overflow: unset;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
      opacity: 0.9;
      text-align: center;
    }
  }
  
  @media (max-width: 640px) {
    .grid-mobile-optimized {
      gap: 0.4rem;
      padding: 0.4rem;
    }
    
    .slot-mobile {
      min-height: 5.5rem;
      font-size: 0.9rem;
      padding: 0.4rem;
      border-radius: 0.5rem;
    }
    
    .slot-mobile .slot-time {
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 0.15rem;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.85rem;
      line-height: 1.3;
      margin-top: 0.15rem;
      max-width: 100%;
      overflow: visible;
      text-overflow: unset;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .grid-mobile-optimized {
      gap: 0.3rem;
      padding: 0.3rem;
    }
    
    .slot-mobile {
      min-height: 5rem;
      font-size: 0.8rem;
      padding: 0.3rem;
    }
    
    .slot-mobile .slot-time {
      font-size: 0.85rem;
      line-height: 1.3;
      margin-bottom: 0.1rem;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.75rem;
      margin-top: 0.1rem;
      line-height: 1.3;
      overflow: visible;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
      text-align: center;
    }
  }
  
  @media (max-width: 375px) {
    .grid-mobile-optimized {
      gap: 0.25rem;
    }
    
    .slot-mobile {
      min-height: 4.5rem;
      font-size: 0.75rem;
      padding: 0.25rem;
    }
    
    .slot-mobile .slot-time {
      font-size: 0.8rem;
      margin-bottom: 0.1rem;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.7rem;
      margin-top: 0.1rem;
      line-height: 1.3;
      overflow: visible;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
      text-align: center;
    }
    
    /* Otimizações específicas para informações de passageiro */
    .slot-mobile .passenger-info {
      font-size: 0.7rem;
      line-height: 1.2;
      margin: 0.1rem 0;
      word-wrap: break-word;
      word-break: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      text-align: center;
    }
    
    .slot-mobile .tour-info {
      font-size: 0.65rem;
      line-height: 1.1;
      margin-top: 0.1rem;
      font-weight: 500;
      color: #374151;
      word-wrap: break-word;
      text-align: center;
    }
    }
  }
  
  /* Otimizações para telas maiores - Desktop/PC */
  @media (min-width: 1024px) {
    .slot-mobile {
      min-height: 9.5rem;
      font-size: 0.7rem;
      padding: 0.8rem 0.4rem 0.8rem 0.4rem;
      line-height: 1.25;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      word-break: break-word;
      white-space: normal;
    }
    .slot-mobile .slot-time {
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.15rem;
      word-break: break-word;
      white-space: normal;
      text-align: center;
    }
    .slot-mobile .slot-status {
      font-size: 0.7rem !important;
      margin-top: 0.15rem;
      line-height: 1.25;
      word-break: break-word;
      white-space: normal;
      text-align: center;
      max-width: 100%;
      overflow-wrap: break-word;
    }
    .slot-mobile .slot-status span {
      font-size: 0.7rem !important;
      word-break: break-word;
      white-space: normal;
    }
    .slot-mobile .tour-info,
    .slot-mobile .passenger-info {
      font-size: 0.65rem;
      line-height: 1.1;
      word-break: break-word;
      white-space: normal;
      text-align: center;
    }
  }
  
  @media (min-width: 1280px) {
    .slot-mobile {
      min-height: 11rem;
      font-size: 0.75rem;
      padding: 1rem 0.5rem 1rem 0.5rem;
      line-height: 1.3;
    }
    .slot-mobile .slot-time {
      font-size: 0.9rem;
      margin-bottom: 0.18rem;
    }
    .slot-mobile .slot-status {
      font-size: 0.75rem !important;
      margin-top: 0.18rem;
      line-height: 1.3;
      word-break: break-word;
      white-space: normal;
      text-align: center;
      max-width: 100%;
      overflow-wrap: break-word;
    }
    .slot-mobile .slot-status span {
      font-size: 0.75rem !important;
      word-break: break-word;
      white-space: normal;
    }
    .slot-mobile .tour-info,
    .slot-mobile .passenger-info {
      font-size: 0.7rem;
      line-height: 1.15;
    }
  }
  
  @media (min-width: 1536px) {
    .slot-mobile {
      min-height: 13rem;
      font-size: 0.8rem;
      padding: 1.2rem 0.7rem 1.2rem 0.7rem;
      line-height: 1.35;
    }
    .slot-mobile .slot-time {
      font-size: 1rem;
      margin-bottom: 0.22rem;
    }
    .slot-mobile .slot-status {
      font-size: 0.8rem !important;
      margin-top: 0.22rem;
      line-height: 1.35;
      word-break: break-word;
      white-space: normal;
      text-align: center;
      max-width: 100%;
      overflow-wrap: break-word;
    }
    .slot-mobile .slot-status span {
      font-size: 0.8rem !important;
      word-break: break-word;
      white-space: normal;
    }
    .slot-mobile .passenger-info,
    .slot-mobile .tour-info {
      font-size: 0.4rem;
      line-height: 1.15;
    }
  }
`;

// Condutores fallback caso não carregue do banco
export const FALLBACK_CONDUCTORS = [
  {
    id: "condutor1",
    name: "Condutor 1",
    whatsapp: "351963496320",
  },
  {
    id: "condutor2",
    name: "Condutor 2",
    whatsapp: "351968784043",
  },
];

// Função para obter nome do tour amigável
export const getTourDisplayName = (tourType: string): string => {
  const tourNames: Record<string, string> = {
    panoramic: "Tour Panorâmico",
    furnas: "Tour das Furnas",
    bridge: "Tour da Ponte",
    sunset: "Tour do Pôr-do-Sol",
    night: "Tour Noturno",
    fishermen: "Tour dos Pescadores",
  };

  return tourNames[tourType] || tourType;
};

// Função para obter configuração de status
export const getStatusConfig = (status: string) => {
  const statusConfig = {
    confirmed: { color: "bg-green-100 text-green-800", text: "Confirmada" },
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Pendente" },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada" },
    completed: { color: "bg-blue-100 text-blue-800", text: "Concluída" },
  };

  return (
    statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    }
  );
};

// Função para obter texto de status condensado para mobile
export const getCondensedStatusText = (
  status: string,
  statusMessage?: string
): string => {
  if (statusMessage && statusMessage.length > 0) {
    // Para mobile, truncar mensagens longas
    if (window.innerWidth < 640) {
      return statusMessage.length > 8
        ? statusMessage.substring(0, 8) + "..."
        : statusMessage;
    }
    return statusMessage.length > 12
      ? statusMessage.substring(0, 12) + "..."
      : statusMessage;
  }

  // Status padrão condensados para mobile
  const condensedStatus = {
    available: "Livre",
    occupied: "Ocupado",
    blocked: "Bloq.",
    buffer: "Tour",
    Disponível: "Livre",
    Ocupado: "Ocupado",
    Bloqueado: "Bloq.",
    "Tour em andamento": "Tour",
    "Reserva confirmada": "Reserva",
    "Bloqueado pelo admin": "Bloq.",
  };

  return condensedStatus[status as keyof typeof condensedStatus] || status;
};
