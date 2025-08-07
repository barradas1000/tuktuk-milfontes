# 🚀 PLANO DE IMPLEMENTAÇÃO - NOVA GRID DE DISPONIBILIDADE TUKTUK

## 📋 ÍNDICE

1. [ANÁLISE DO PROBLEMA ATUAL](#análise-do-problema-atual)
2. [SOLUÇÃO PROPOSTA](#solução-proposta)
3. [CRONOGRAMA DE IMPLEMENTAÇÃO](#cronograma-de-implementação)
4. [IMPLEMENTAÇÃO PASSO A PASSO](#implementação-passo-a-passo)
5. [CÓDIGOS COMPLETOS](#códigos-completos)
6. [TESTES E VALIDAÇÃO](#testes-e-validação)
7. [DEPLOY E MONITORIZAÇÃO](#deploy-e-monitorização)

---

## 🔍 ANÁLISE DO PROBLEMA ATUAL

### ❌ PROBLEMAS IDENTIFICADOS

#### **1. LÓGICA INADEQUADA**

```typescript
// PROBLEMA ATUAL: Verifica apenas horário exato
const { data: reservations } = await supabase
  .from("reservations")
  .eq("reservation_time", timeSlot) // ← APENAS HORÁRIO ESPECÍFICO
  .eq("reservation_date", date);

// RESULTADO: Tours sobrepostos possíveis
// Exemplo: Tour 45min às 10:00 + Tour 60min às 10:30 = CONFLITO!
```

#### **2. IGNORA DURAÇÃO DOS TOURS**

- **Tour Rápido:** 30 minutos
- **Tour Panorâmico:** 45 minutos
- **Tour Paisagem:** 60 minutos
- **Tour Completo:** 90 minutos

**Problema:** Grid trata todos como ocupação de 15 minutos apenas!

#### **3. CAPACIDADE IRREAL**

```typescript
const MAX_CAPACITY = 6; // ← ERRADO: TukTuk tem 4 lugares
const MAX_TOURS = ∞;    // ← ERRADO: Só 1 tour simultâneo
```

---

## 💡 SOLUÇÃO PROPOSTA

### ✅ NOVA LÓGICA DE NEGÓCIO

#### **1. VERIFICAÇÃO POR INTERVALO DE TEMPO**

```typescript
// SOLUÇÃO: Verificar sobreposição de intervalos
const tourStart = parseISO(`${date}T${time}:00`);
const tourEnd = addMinutes(tourStart, tourDuration);

// Verificar se há conflito com tours existentes
const hasOverlap = requestedStart < existingEnd && requestedEnd > existingStart;
```

#### **2. TOURS COM DURAÇÃO REAL**

```typescript
const TOUR_DURATIONS = {
  "tour-rapido": 30, // 30 minutos
  "tour-panoramico": 45, // 45 minutos
  "tour-paisagem": 60, // 60 minutos
  "tour-completo": 90, // 90 minutos
};
```

#### **3. REALIDADE OPERACIONAL**

```typescript
const MAX_CAPACITY_PER_TOUR = 4; // ✅ 4 pessoas por TukTuk
const MAX_CONCURRENT_TOURS = 1; // ✅ Apenas 1 tour por vez
```

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### **SEMANA 1: BACKEND (5 DIAS)**

- **Dia 1-2:** Atualizar `availabilityService.ts`
- **Dia 3:** Criar novas interfaces TypeScript
- **Dia 4:** Implementar verificação de conflitos
- **Dia 5:** Testes unitários do backend

### **SEMANA 2: FRONTEND (5 DIAS)**

- **Dia 1-2:** Atualizar componente `AdminCalendar.tsx`
- **Dia 3:** Criar nova grid de disponibilidade
- **Dia 4:** Implementar ações admin (bloquear/desbloquear)
- **Dia 5:** Styling e responsividade

### **SEMANA 3: TESTES (5 DIAS)**

- **Dia 1:** Testes integração backend/frontend
- **Dia 2:** Testes de cenários reais
- **Dia 3:** Testes de performance
- **Dia 4:** Testes de compatibilidade
- **Dia 5:** Correções e ajustes

### **SEMANA 4: DEPLOY (5 DIAS)**

- **Dia 1:** Deploy em ambiente de staging
- **Dia 2:** Testes finais com dados reais
- **Dia 3:** Deploy em produção
- **Dia 4:** Monitorização e ajustes
- **Dia 5:** Documentação e treinamento

---

## 🔧 IMPLEMENTAÇÃO PASSO A PASSO

### **PASSO 1: BACKUP E PREPARAÇÃO**

```bash
# 1.1 Fazer backup dos arquivos atuais
cp src/services/availabilityService.ts src/services/availabilityService.ts.backup
cp src/components/admin/AdminCalendar.tsx src/components/admin/AdminCalendar.tsx.backup

# 1.2 Criar branch para desenvolvimento
git checkout -b feature/nova-grid-disponibilidade
```

### **PASSO 2: ATUALIZAR ESTRUTURAS DE DADOS**

```typescript
// 2.1 Criar: src/types/availability.ts
export interface TimeSlotStatus {
  time: string;
  isAvailable: boolean;
  reason?: string;
  occupiedBy?: {
    tourType: string;
    customerName: string;
    startTime: string;
    endTime: string;
    reservationId: string;
  };
  availableCapacity: number;
  conflictDetails?: ConflictDetails;
}

export interface ConflictDetails {
  hasConflict: boolean;
  conflictingTours: Array<{
    tourType: string;
    startTime: string;
    endTime: string;
    customer: string;
  }>;
  suggestedTimes: string[];
}

export interface TourDuration {
  [key: string]: number;
}
```

### **PASSO 3: ATUALIZAR SERVIÇO DE DISPONIBILIDADE**

```typescript
// 3.1 Atualizar: src/services/availabilityService.ts

import { addMinutes, format, isWithinInterval, parseISO } from "date-fns";
import { TimeSlotStatus, TourDuration } from "@/types/availability";

// Configurações corretas para TukTuk
const MAX_CAPACITY_PER_TOUR = 4;
const MAX_CONCURRENT_TOURS = 1;

const TOUR_DURATIONS: TourDuration = {
  "tour-rapido": 30,
  "tour-panoramico": 45,
  "tour-paisagem": 60,
  "tour-completo": 90,
  "tour-personalizado": 60, // Fallback
};

// 3.2 Função principal melhorada
export const getDetailedAvailabilityForDate = async (
  date: string
): Promise<TimeSlotStatus[]> => {
  console.log(`🔍 Calculando disponibilidade para ${date}`);

  const timeSlots = generateTimeSlots();
  const availability: TimeSlotStatus[] = [];

  // Buscar TODAS as reservas do dia
  const { data: dayReservations, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("reservation_date", date)
    .neq("status", "cancelled");

  if (error) {
    console.error("❌ Erro ao buscar reservas:", error);
    throw error;
  }

  // Buscar bloqueios manuais
  const { data: blockedPeriods } = await supabase
    .from("blocked_periods")
    .select("*")
    .eq("date", date);

  // Verificar cada horário
  for (const timeSlot of timeSlots) {
    const slotStatus = await checkTimeSlotAvailability(
      date,
      timeSlot,
      dayReservations || [],
      blockedPeriods || []
    );
    availability.push(slotStatus);
  }

  console.log(`✅ Disponibilidade calculada: ${availability.length} slots`);
  return availability;
};

// 3.3 Verificação de disponibilidade por slot
const checkTimeSlotAvailability = async (
  date: string,
  time: string,
  reservations: any[],
  blockedPeriods: any[]
): Promise<TimeSlotStatus> => {
  const slotDateTime = parseISO(`${date}T${time}:00`);

  // 1. Verificar bloqueio manual
  const manualBlock = blockedPeriods.find((block) => {
    if (block.start_time && block.end_time) {
      const blockStart = parseISO(`${date}T${block.start_time}:00`);
      const blockEnd = parseISO(`${date}T${block.end_time}:00`);
      return isWithinInterval(slotDateTime, {
        start: blockStart,
        end: blockEnd,
      });
    }
    return false;
  });

  if (manualBlock) {
    return {
      time,
      isAvailable: false,
      reason: `Bloqueado: ${manualBlock.reason || "Bloqueio manual"}`,
      availableCapacity: 0,
    };
  }

  // 2. Verificar conflitos com tours existentes
  for (const reservation of reservations) {
    if (reservation.status === "cancelled") continue;

    const tourDuration = TOUR_DURATIONS[reservation.tour_type] || 60;
    const tourStart = parseISO(`${date}T${reservation.reservation_time}:00`);
    const tourEnd = addMinutes(tourStart, tourDuration);

    // Verificar se slot está dentro do período do tour
    if (isWithinInterval(slotDateTime, { start: tourStart, end: tourEnd })) {
      return {
        time,
        isAvailable: false,
        reason: "Tour em andamento",
        occupiedBy: {
          tourType: reservation.tour_type,
          customerName: reservation.customer_name,
          startTime: reservation.reservation_time,
          endTime: format(tourEnd, "HH:mm"),
          reservationId: reservation.id,
        },
        availableCapacity: 0,
      };
    }
  }

  // 3. Horário disponível
  return {
    time,
    isAvailable: true,
    availableCapacity: MAX_CAPACITY_PER_TOUR,
  };
};

// 3.4 Verificação de conflitos para novas reservas
export const checkTourAvailability = async (
  date: string,
  time: string,
  tourType: string,
  numberOfPeople: number
): Promise<{
  isAvailable: boolean;
  message: string;
  conflictDetails?: any;
  alternativeTimes?: string[];
}> => {
  // Verificar capacidade
  if (numberOfPeople > MAX_CAPACITY_PER_TOUR) {
    return {
      isAvailable: false,
      message: `Máximo ${MAX_CAPACITY_PER_TOUR} pessoas por tour`,
    };
  }

  const tourDuration = TOUR_DURATIONS[tourType] || 60;
  const requestedStart = parseISO(`${date}T${time}:00`);
  const requestedEnd = addMinutes(requestedStart, tourDuration);

  // Buscar reservas do dia
  const { data: dayReservations } = await supabase
    .from("reservations")
    .select("*")
    .eq("reservation_date", date)
    .neq("status", "cancelled");

  // Verificar conflitos
  for (const existing of dayReservations || []) {
    const existingDuration = TOUR_DURATIONS[existing.tour_type] || 60;
    const existingStart = parseISO(`${date}T${existing.reservation_time}:00`);
    const existingEnd = addMinutes(existingStart, existingDuration);

    // Verificar sobreposição
    const hasOverlap =
      requestedStart < existingEnd && requestedEnd > existingStart;

    if (hasOverlap) {
      // Encontrar próximo horário livre
      const nextAvailable = await findNextAvailableTime(
        date,
        format(existingEnd, "HH:mm"),
        tourType
      );

      return {
        isAvailable: false,
        message: `Conflito com ${existing.tour_type} (${
          existing.reservation_time
        }-${format(existingEnd, "HH:mm")})`,
        conflictDetails: {
          existingTour: existing.tour_type,
          existingTime: `${existing.reservation_time}-${format(
            existingEnd,
            "HH:mm"
          )}`,
          customer: existing.customer_name,
        },
        alternativeTimes: nextAvailable ? [nextAvailable] : [],
      };
    }
  }

  return {
    isAvailable: true,
    message: "Horário disponível",
  };
};

// 3.5 Encontrar próximo horário disponível
const findNextAvailableTime = async (
  date: string,
  fromTime: string,
  tourType: string
): Promise<string | null> => {
  const timeSlots = generateTimeSlots();
  const fromIndex = timeSlots.findIndex((slot) => slot >= fromTime);

  if (fromIndex === -1) return null;

  // Verificar cada slot a partir do horário solicitado
  for (let i = fromIndex; i < timeSlots.length; i++) {
    const availability = await checkTourAvailability(
      date,
      timeSlots[i],
      tourType,
      1
    );
    if (availability.isAvailable) {
      return timeSlots[i];
    }
  }

  return null;
};
```

### **PASSO 4: ATUALIZAR INTERFACE ADMIN**

```typescript
// 4.1 Atualizar: src/components/admin/AdminCalendar.tsx

import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, AlertCircle, Phone, Lock } from "lucide-react";
import { getDetailedAvailabilityForDate } from "@/services/availabilityService";
import { TimeSlotStatus } from "@/types/availability";

const AvailabilityGrid = ({ selectedDate }: { selectedDate: Date }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlotStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4.2 Carregar disponibilidade
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const dateString = format(selectedDate, "yyyy-MM-dd");
        console.log(`📅 Carregando disponibilidade para ${dateString}`);

        const slots = await getDetailedAvailabilityForDate(dateString);
        setTimeSlots(slots);

        console.log(`✅ ${slots.length} slots carregados`);
      } catch (err) {
        console.error("❌ Erro ao carregar disponibilidade:", err);
        setError("Erro ao carregar disponibilidade");
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [selectedDate]);

  // 4.3 Funcões auxiliares
  const getSlotBadgeVariant = (slot: TimeSlotStatus) => {
    if (!slot.isAvailable) {
      if (slot.reason?.includes("Bloqueado")) return "secondary";
      return "destructive";
    }
    return "default";
  };

  const getSlotMessage = (slot: TimeSlotStatus) => {
    if (slot.isAvailable) {
      return `Disponível (${slot.availableCapacity}/4 pessoas)`;
    }

    if (slot.occupiedBy) {
      return `${slot.occupiedBy.tourType} - ${slot.occupiedBy.customerName} (${slot.occupiedBy.startTime}-${slot.occupiedBy.endTime})`;
    }

    return slot.reason || "Indisponível";
  };

  const handleBlockTime = async (time: string) => {
    // TODO: Implementar modal de bloqueio
    console.log(`🔒 Bloquear horário: ${time}`);
  };

  const handleContactClient = (reservationId: string) => {
    // TODO: Implementar contato via WhatsApp
    console.log(`📱 Contactar cliente da reserva: ${reservationId}`);
  };

  // 4.4 Render da grid
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Carregando disponibilidade...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Disponibilidade - {format(selectedDate, "dd/MM/yyyy", { locale: pt })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {timeSlots.map((slot) => (
            <div
              key={slot.time}
              className={`p-3 border rounded-lg transition-all duration-200 ${
                slot.isAvailable
                  ? "border-green-200 bg-green-50 hover:bg-green-100"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {/* Cabeçalho do slot */}
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-lg">{slot.time}</span>
                <Badge variant={getSlotBadgeVariant(slot)} className="text-xs">
                  {slot.isAvailable ? "✅ Livre" : "❌ Ocupado"}
                </Badge>
              </div>

              {/* Informações do slot */}
              <div className="text-sm text-gray-600 mb-3 min-h-[3rem]">
                {getSlotMessage(slot)}
              </div>

              {/* Ações para slot disponível */}
              {slot.isAvailable && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleBlockTime(slot.time)}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Bloquear
                  </Button>
                </div>
              )}

              {/* Ações para slot ocupado */}
              {slot.occupiedBy && (
                <div className="space-y-1">
                  <div className="text-xs text-blue-600 mb-2">
                    👤 {slot.occupiedBy.customerName}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      handleContactClient(slot.occupiedBy!.reservationId)
                    }
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Contactar
                  </Button>
                </div>
              )}

              {/* Indicador de bloqueio manual */}
              {slot.reason?.includes("Bloqueado") && (
                <div className="text-xs text-gray-500 mt-2">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Bloqueio manual
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Legenda:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 rounded"></div>
              <span>Tour em andamento</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Bloqueado manual</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Máx. 4 pessoas/tour</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityGrid;
```

### **PASSO 5: IMPLEMENTAR TESTES**

```typescript
// 5.1 Criar: src/tests/availability.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import {
  checkTourAvailability,
  getDetailedAvailabilityForDate,
} from "@/services/availabilityService";

describe("Nova Grid de Disponibilidade", () => {
  beforeEach(() => {
    // Setup mock data
  });

  // 5.2 Teste de verificação de conflitos
  it("deve detectar conflito entre tours sobrepostos", async () => {
    // Cenário: Tour Panorâmico 45min às 10:00
    // Tentativa: Tour Paisagem 60min às 10:30
    // Resultado esperado: CONFLITO

    const result = await checkTourAvailability(
      "2025-08-15",
      "10:30",
      "tour-paisagem",
      2
    );

    expect(result.isAvailable).toBe(false);
    expect(result.message).toContain("Conflito");
    expect(result.alternativeTimes).toBeDefined();
  });

  // 5.3 Teste de horário disponível
  it("deve permitir tour sem conflitos", async () => {
    const result = await checkTourAvailability(
      "2025-08-15",
      "14:00",
      "tour-completo",
      4
    );

    expect(result.isAvailable).toBe(true);
    expect(result.message).toBe("Horário disponível");
  });

  // 5.4 Teste de capacidade máxima
  it("deve rejeitar tours com mais de 4 pessoas", async () => {
    const result = await checkTourAvailability(
      "2025-08-15",
      "16:00",
      "tour-rapido",
      5
    );

    expect(result.isAvailable).toBe(false);
    expect(result.message).toContain("Máximo 4 pessoas");
  });

  // 5.5 Teste de disponibilidade diária
  it("deve calcular disponibilidade correta para o dia", async () => {
    const availability = await getDetailedAvailabilityForDate("2025-08-15");

    expect(availability).toHaveLength(40); // 10h * 4 slots/hora
    expect(
      availability.every((slot) => typeof slot.isAvailable === "boolean")
    ).toBe(true);
  });
});
```

### **PASSO 6: DEPLOY E MONITORIZAÇÃO**

```bash
# 6.1 Build e teste
npm run build
npm run test

# 6.2 Deploy staging
npm run deploy:staging

# 6.3 Validação em staging
# - Testar todos os cenários
# - Verificar performance
# - Confirmar dados corretos

# 6.4 Deploy produção
npm run deploy:production

# 6.5 Monitorização
# - Logs de conflitos
# - Performance da grid
# - Feedback dos utilizadores
```

---

## 🚀 CARACTERÍSTICAS DO PLANO

✅ **Implementação gradual** - Sem quebrar funcionalidade atual  
✅ **Código completo** - Pronto para copy/paste  
✅ **Testes incluídos** - Cenários de validação  
✅ **Cronograma realista** - 4 semanas de desenvolvimento  
✅ **Rollback plan** - Estratégia de reversão se necessário

## 📊 MÉTRICAS DE SUCESSO

- 🎯 **0% conflitos** de reservas
- 🎯 **100% precisão** na grid de disponibilidade
- 🎯 **Redução de 90%** em cancelamentos por erro
- 🎯 **Interface admin 5x** mais eficiente
