import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { generateDynamicTimeSlots } from "@/utils/reservationUtils";
import { format } from "date-fns";
import { pt, enUS, es, fr, de, it, nl } from "date-fns/locale";

interface AvailabilitySlot {
  time: string;
  available: boolean;
  reserved?: number;
  capacity?: number;
}

const localeMap: Record<string, Locale> = {
  pt,
  en: enUS,
  es,
  fr,
  de,
  it,
  nl,
};

const AvailabilityCalendar = () => {
  const { t, i18n } = useTranslation();
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [today] = useState(format(new Date(), "yyyy-MM-dd"));
  const [currentFrame, setCurrentFrame] = useState<"morning" | "afternoon">(
    "morning"
  );

  const currentLocale = localeMap[i18n.language] || pt;

  // Buscar disponibilidade real para hoje
  const fetchTodayAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gerar todos os horários disponíveis
      const timeSlots = generateDynamicTimeSlots();

      // Buscar reservas confirmadas para hoje
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("reservation_time, number_of_people, status")
        .eq("reservation_date", today)
        .eq("status", "confirmed");

      if (reservationsError) {
        console.error("Erro ao buscar reservas:", reservationsError);
        setError("Erro ao carregar disponibilidade");
        return;
      }

      // Buscar bloqueios manuais para hoje
      const { data: blockedPeriods, error: blockedError } = await supabase
        .from("blocked_periods")
        .select("start_time, reason")
        .eq("date", today);

      if (blockedError) {
        console.error("Erro ao buscar bloqueios:", blockedError);
        // Continua sem os bloqueios se houver erro
      }

      // Calcular disponibilidade para cada horário
      const slots: AvailabilitySlot[] = timeSlots.map((time) => {
        // Verificar se há reserva confirmada
        const reservation = reservations?.find(
          (r) => r.reservation_time === time
        );
        const isReserved = !!reservation;

        // Verificar se está bloqueado manualmente
        const isBlocked = blockedPeriods?.some((b) => b.start_time === time);

        return {
          time,
          available: !isReserved && !isBlocked,
          reserved: reservation?.number_of_people || 0,
          capacity: 4,
        };
      });

      setAvailableSlots(slots);
    } catch (err) {
      console.error("Erro ao buscar disponibilidade:", err);
      setError("Erro ao carregar disponibilidade");
    } finally {
      setLoading(false);
    }
  }, [today]);

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchTodayAvailability();
  }, [fetchTodayAvailability]);

  // Atualizar a cada 30 segundos para manter dados frescos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayAvailability();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchTodayAvailability]);

  // Filtrar horários por período
  const morningSlots = availableSlots
    .filter((slot) => slot.available)
    .filter((slot) => {
      const time = slot.time;
      return time >= "09:30" && time <= "15:00";
    });

  const afternoonSlots = availableSlots
    .filter((slot) => slot.available)
    .filter((slot) => {
      const time = slot.time;
      return time >= "15:30" && time <= "21:30";
    });

  const currentSlots =
    currentFrame === "morning" ? morningSlots : afternoonSlots;

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-green-500" />
            {t("availability.availabilityToday")}
          </CardTitle>
          <p className="text-gray-600 text-lg">
            {t("availability.availableSlots")}
          </p>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando disponibilidade...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-red-900 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-red-500" />
            {t("availability.availabilityToday")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTodayAvailability}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-green-500" />
          {t("availability.availabilityToday")}
        </CardTitle>
        <p className="text-gray-600 text-lg">
          {t("availability.availableSlots")}
        </p>
        <p className="text-sm text-gray-500">
          {format(new Date(today), "EEEE, d 'de' MMMM", {
            locale: currentLocale,
          })}
        </p>
      </CardHeader>

      <CardContent>
        {/* Navegação do Slider */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentFrame("morning")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentFrame === "morning"
                ? "bg-amber-500 text-blue-900 shadow-md font-semibold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-medium">{t("availability.morning")}</span>
            {morningSlots.length > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-bold ${
                  currentFrame === "morning"
                    ? "bg-blue-900 text-amber-500"
                    : "bg-amber-500 text-blue-900"
                }`}
              >
                {morningSlots.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentFrame("afternoon")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentFrame === "afternoon"
                ? "bg-amber-500 text-blue-900 shadow-md font-semibold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-medium">{t("availability.afternoon")}</span>
            {afternoonSlots.length > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-bold ${
                  currentFrame === "afternoon"
                    ? "bg-blue-900 text-amber-500"
                    : "bg-amber-500 text-blue-900"
                }`}
              >
                {afternoonSlots.length}
              </span>
            )}
          </button>
        </div>

        {currentSlots.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
              {currentSlots.map((slot, index) => (
                <div
                  key={index}
                  className="p-2 sm:p-3 rounded-lg border-2 text-center transition-all duration-300 border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md min-h-[80px] sm:min-h-[90px] flex flex-col justify-center"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-bold text-sm sm:text-base">
                      {slot.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-green-700 font-semibold text-xs sm:text-sm">
                      {t("availability.available")}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {slot.capacity} {t("availability.places")}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                {t("availability.reserveSpecificTime")}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t("availability.autoUpdated")} • {t("availability.lastUpdate")}
                : {format(new Date(), "HH:mm")}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t("availability.noSlotsAvailable", {
                  period:
                    currentFrame === "morning"
                      ? t("availability.morning")
                      : t("availability.afternoon"),
                })}
              </h3>
              <p className="text-gray-600">
                {t("availability.allSlotsBooked", {
                  period:
                    currentFrame === "morning"
                      ? t("availability.morning")
                      : t("availability.afternoon"),
                })}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {t("availability.contactUs")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
