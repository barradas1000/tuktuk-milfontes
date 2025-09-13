import React, { useState, useContext, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Clock, MessageCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import i18n from "i18next";
import { checkAvailability } from "@/services/availabilityService";
import AlternativeTimesModal from "./AlternativeTimesModal";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/contexts/AuthContextInstance";

// Dados externos
import tourTypes from "@/data/tourTypes";
import { getActiveConductors } from "@/data/conductors";

// Função para interpolar variáveis na mensagem
function interpolateMessage(message: string, variables: Record<string, string>) {
  return message.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || _);
}

const ReservationForm = () => {
  const { t } = useTranslation();
  const auth = useContext(AuthContext);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    tourType: "",
    numberOfPeople: "2",
    message: "",
  });

  const [availabilityInfo, setAvailabilityInfo] = useState({
    isOpen: false,
    requestedDate: "",
    requestedTime: "",
    requestedPeople: 0,
    existingPeople: 0,
    maxCapacity: 1,
    alternativeTimes: [] as string[],
  });

  interface AvailabilityStatus {
    isChecking: boolean;
    isAvailable: boolean;
    existingPeople: number;
    maxCapacity: number;
    message: string;
    alternativeTimes: string[];
  }

  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>({
    isChecking: false,
    isAvailable: true,
    existingPeople: 0,
    maxCapacity: 1,
    message: "",
    alternativeTimes: [],
  });

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Estado para controlar se está processando uma reserva
  const [isProcessingReservation, setIsProcessingReservation] = useState(false);

  // --- Submissão ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evitar submissões consecutivas
    if (isProcessingReservation) return;

    setIsProcessingReservation(true);

    const availability = await checkAvailability(
      formData.date,
      formData.time,
      Number(formData.numberOfPeople),
      formData.tourType
    );

    if (!availability.isAvailable) {
      setAvailabilityInfo({
        isOpen: true,
        requestedDate: formData.date,
        requestedTime: formData.time,
        requestedPeople: Number(formData.numberOfPeople),
        existingPeople: availability.existingReservations,
        maxCapacity: availability.maxCapacity,
        alternativeTimes: availability.alternativeTimes,
      });
      setIsProcessingReservation(false);
      return;
    }

    await processReservation();
    setIsProcessingReservation(false);
  };

  // --- Processar Reserva ---
  const processReservation = async () => {
    const selectedTour = tourTypes.find((tour) => tour.id === formData.tourType);

    const variables = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tour_type: selectedTour ? t(selectedTour.titleKey) : "",
      reservation_date: formData.date,
      reservation_time: formData.time,
      number_of_people: formData.numberOfPeople,
      message: formData.message,
      total_price: selectedTour ? selectedTour.price.toString() : "",
      created_at: new Date().toLocaleString(i18n.language),
    };

    let rawMessage = t("reservation.clientReservationMessage");
    if (!rawMessage || rawMessage.includes("reservation.clientReservationMessage")) {
      rawMessage = `Olá, gostaria de reservar o passeio '{{tour_type}}' para o dia {{reservation_date}} às {{reservation_time}} para {{number_of_people}} pessoas. Nome: {{name}}. {{message}}`;
    }

    const message = interpolateMessage(rawMessage, variables);

    try {
      // Verificar se já existe uma reserva idêntica
      const { data: existing } = await supabase
        .from("reservations")
        .select("*")
        .eq("customer_email", formData.email || "")
        .eq("reservation_date", formData.date)
        .eq("reservation_time", formData.time);

      if (existing && existing.length > 0) {
        toast({
          title: "Reserva já existente",
          description: "Você já possui uma reserva para esta data e hora.",
          variant: "destructive",
        });
        setIsProcessingReservation(false);
        return;
      }

      const { error } = await supabase.from("reservations").insert([
        {
          customer_name: formData.name,
          customer_email: (formData.email || "").trim(),
          customer_phone: formData.phone,
          reservation_date: formData.date,
          reservation_time: formData.time,
          number_of_people: Number(formData.numberOfPeople),
          tour_type: formData.tourType,
          special_requests: formData.message,
          status: "pending",
          language: i18n.language,
        },
      ]);

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro ao registar reserva", description: errorMessage, variant: "destructive" });
      return;
    }

    let phoneNumber: string | null = null;
    let adminName = "";

    if (auth.profile?.whatsapp) {
      phoneNumber = auth.profile.whatsapp;
      adminName = auth.profile.full_name;
    } else {
      try {
        const activeConductors = await getActiveConductors();
        if (activeConductors.length > 0 && activeConductors[0].whatsapp) {
          phoneNumber = activeConductors[0].whatsapp;
          adminName = activeConductors[0].name || "";
        }
      } catch (e) {
        console.error("Erro ao buscar condutores ativos:", e);
      }
    }

    if (!phoneNumber) {
      toast({
        title: "Erro de contacto",
        description: "Não foi possível encontrar um número de WhatsApp para contacto.",
        variant: "destructive",
      });
      return;
    }

    const finalMessage = message + (adminName ? `\n\nWhatsApp responsável: ${adminName} (${phoneNumber})` : `\n\nWhatsApp responsável: ${phoneNumber}`);
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`, "_blank");

    toast({ title: t("reservation.reservationSent"), description: t("reservation.reservationDescription") });

    // Resetar formulário após reserva bem-sucedida
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      tourType: "",
      numberOfPeople: "2",
      message: "",
    });
    setAvailabilityStatus({
      isChecking: false,
      isAvailable: true,
      existingPeople: 0,
      maxCapacity: 1,
      message: "",
      alternativeTimes: [],
    });
  };

  // --- Modal ---
  const handleSelectAlternative = async (alternativeTime: string) => {
    setFormData((prev) => ({ ...prev, time: alternativeTime }));
    setAvailabilityInfo((prev) => ({ ...prev, isOpen: false }));

    // Aguardar re-render e processar reserva
    setTimeout(async () => {
      if (isProcessingReservation) return;
      setIsProcessingReservation(true);
      await processReservation();
      setIsProcessingReservation(false);
    }, 100);
  };

  const handleCloseModal = () => setAvailabilityInfo((prev) => ({ ...prev, isOpen: false }));

  // --- Disponibilidade em tempo real ---
  const checkAvailabilityInRealTime = useCallback(async () => {
    if (!formData.date || !formData.time || !formData.numberOfPeople) {
      setAvailabilityStatus({ isChecking: false, isAvailable: true, existingPeople: 0, maxCapacity: 4, message: "", alternativeTimes: [] });
      return;
    }

    setAvailabilityStatus((prev) => ({ ...prev, isChecking: true }));

    try {
      const availability = await checkAvailability(
        formData.date,
        formData.time,
        Number(formData.numberOfPeople),
        formData.tourType
      );

      setAvailabilityStatus({
        isChecking: false,
        isAvailable: availability.isAvailable,
        existingPeople: availability.existingReservations,
        maxCapacity: availability.maxCapacity,
        message: availability.message,
        alternativeTimes: availability.alternativeTimes || [],
      });
    } catch {
      setAvailabilityStatus({ isChecking: false, isAvailable: true, existingPeople: 0, maxCapacity: 4, message: "Erro ao verificar disponibilidade", alternativeTimes: [] });
    }
  }, [formData]);

  useEffect(() => {
    const timeoutId = setTimeout(checkAvailabilityInRealTime, 500);
    return () => clearTimeout(timeoutId);
  }, [formData, checkAvailabilityInRealTime]);

  useEffect(() => {
    if (!availabilityStatus.isChecking && !availabilityStatus.isAvailable && availabilityStatus.alternativeTimes.length > 0) {
      setAvailabilityInfo({
        isOpen: true,
        requestedDate: formData.date,
        requestedTime: formData.time,
        requestedPeople: Number(formData.numberOfPeople),
        existingPeople: availabilityStatus.existingPeople,
        maxCapacity: availabilityStatus.maxCapacity,
        alternativeTimes: availabilityStatus.alternativeTimes,
      });
    }
  }, [availabilityStatus, formData]);

  // --- Render ---
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-amber-500" />
          {t("reservation.title")}
        </CardTitle>
        <p className="text-gray-600 text-lg">{t("reservation.subtitle")}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome + Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("reservation.name")} *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">{t("reservation.email")} *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
            </div>
          </div>

          {/* Telefone + Pessoas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t("reservation.phone")} *</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required placeholder="Ex: +351912345678" />
            </div>
            <div>
              <Label htmlFor="numberOfPeople">{t("reservation.numberOfPeople")}</Label>
              <Select value={formData.numberOfPeople} onValueChange={(value) => handleInputChange("numberOfPeople", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("reservation.people1")}</SelectItem>
                  <SelectItem value="2">{t("reservation.people2")}</SelectItem>
                  <SelectItem value="3">{t("reservation.people3")}</SelectItem>
                  <SelectItem value="4">{t("reservation.people4")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data + Hora */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">{t("reservation.date")} *</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="time">{t("reservation.time")} *</Label>
              <Input id="time" type="time" value={formData.time} onChange={(e) => handleInputChange("time", e.target.value)} required />
            </div>
          </div>

          {/* Status Disponibilidade */}
          {formData.date && formData.time && formData.numberOfPeople && formData.tourType && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Status de Disponibilidade</h4>
                {availabilityStatus.isChecking ? <span>Verificando...</span> : (
                  <Badge className={availabilityStatus.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {availabilityStatus.isAvailable ? "Disponível" : "Indisponível"}
                  </Badge>
                )}
              </div>
              {!availabilityStatus.isChecking && (
                <div className="text-sm space-y-1">
                  <p>Pessoas já reservadas: {availabilityStatus.existingPeople} / {availabilityStatus.maxCapacity}</p>
                  <p>Sua reserva: {formData.numberOfPeople} pessoas</p>
                  {availabilityStatus.message && <p className="text-gray-600">{availabilityStatus.message}</p>}
                </div>
              )}
            </div>
          )}

          {/* Tipo de Tour */}
          <div>
            <Label htmlFor="tourType">{t("reservation.tourType")} *</Label>
            <Select value={formData.tourType} onValueChange={(value) => handleInputChange("tourType", value)} required>
              <SelectTrigger><SelectValue placeholder={t("reservation.selectTour")} /></SelectTrigger>
              <SelectContent>
                {tourTypes.map((tour) => <SelectItem key={tour.id} value={tour.id}>{t(tour.titleKey)} - €{tour.price}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem */}
          <div>
            <Label htmlFor="message">{t("reservation.message")}</Label>
            <Textarea id="message" value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} placeholder={t("reservation.messagePlaceholder")} rows={3} />
          </div>

          {/* Botão */}
          <Button type="submit" size="lg" className="w-full" disabled={!formData.tourType || isProcessingReservation}>
            <MessageCircle className="w-6 h-6 mr-3" />
            {isProcessingReservation ? "Processando reserva..." : t("reservation.confirmWhatsApp")}
          </Button>
        </form>
      </CardContent>

      <AlternativeTimesModal
        isOpen={availabilityInfo.isOpen}
        onClose={handleCloseModal}
        onSelectTime={handleSelectAlternative}
        selectedDate={availabilityInfo.requestedDate}
        alternativeTimes={availabilityInfo.alternativeTimes}
      />
    </Card>
  );
};

export default ReservationForm;
