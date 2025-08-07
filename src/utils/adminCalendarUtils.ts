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
      gap: 0.3rem;
      padding: 0.3rem;
    }
    
    .slot-mobile {
      min-height: 4rem;
      font-size: 0.75rem;
      padding: 0.25rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease-in-out;
      border-width: 1px;
    }
    
    .slot-mobile:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .slot-mobile .slot-time {
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.2;
      color: #1f2937;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.7rem;
      line-height: 1.1;
      margin-top: 0.2rem;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0.9;
    }
  }
  
  @media (max-width: 640px) {
    .grid-mobile-optimized {
      gap: 0.35rem;
      padding: 0.35rem;
    }
    
    .slot-mobile {
      min-height: 4.5rem;
      font-size: 0.8rem;
      padding: 0.3rem;
      border-radius: 0.5rem;
    }
    
    .slot-mobile .slot-time {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.3;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.75rem;
      line-height: 1.2;
      margin-top: 0.25rem;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  @media (max-width: 480px) {
    .grid-mobile-optimized {
      gap: 0.25rem;
      padding: 0.25rem;
    }
    
    .slot-mobile {
      min-height: 3.5rem;
      font-size: 0.7rem;
      padding: 0.2rem;
    }
    
    .slot-mobile .slot-time {
      font-size: 0.8rem;
      line-height: 1.2;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.65rem;
      margin-top: 0.15rem;
    }
  }
  
  @media (max-width: 375px) {
    .grid-mobile-optimized {
      gap: 0.2rem;
    }
    
    .slot-mobile {
      min-height: 3.2rem;
      font-size: 0.65rem;
      padding: 0.15rem;
    }
    
    .slot-mobile .slot-time {
      font-size: 0.75rem;
    }
    
    .slot-mobile .slot-status {
      font-size: 0.6rem;
      margin-top: 0.1rem;
    }
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
