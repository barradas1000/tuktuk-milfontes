import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Users,
  Clock,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import i18n from "i18next";
import { mockBlockedPeriods } from "@/data/mockReservations";
import { checkAvailability } from "@/services/availabilityService";
import AlternativeTimesModal from "./AlternativeTimesModal";
import { Badge } from "@/components/ui/badge";
import { fetchActiveConductors } from "@/services/supabaseService";

const allConductors = [
  { id: "condutor1", whatsapp: "351963496320" },
  { id: "condutor2", whatsapp: "351968784043" },
  // ... outros condutores, se existirem
];

// Função para interpolar variáveis na mensagem
function interpolateMessage(
  message: string,
  variables: Record<string, string>
) {
  return message.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key] || match
  );
}

const ReservationForm = () => {
  console.log("ReservationForm rendering");
  const { t } = useTranslation();

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

  const [availabilityStatus, setAvailabilityStatus] = useState({
    isChecking: false,
    isAvailable: true,
    existingPeople: 0,
    maxCapacity: 1,
    message: "",
  });

  const { toast } = useToast();

  const tourTypes = [
    {
      id: "panoramic",
      name: t("tours.panoramic.title"),
      price: 10,
      duration: 45,
    },
    { id: "furnas", name: t("tours.furnas.title"), price: 14, duration: 60 },
    { id: "bridge", name: t("tours.bridge.title"), price: 10, duration: 45 },
    { id: "sunset", name: t("tours.sunset.title"), price: 25, duration: 90 },
    { id: "night", name: t("tours.night.title"), price: 8, duration: 35 },
    {
      id: "fishermen",
      name: t("tours.fishermen.title"),
      price: 10,
      duration: 45,
    },
  ];

  const isDayBlocked = (date: string) => {
    return mockBlockedPeriods.some(
      (b) => b.date === date && !b.startTime && !b.endTime
    );
  };

  const isTimeBlocked = (date: string, time: string) => {
    return mockBlockedPeriods.some(
      (b) => b.date === date && b.startTime === time
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Checagem de bloqueio
    if (isDayBlocked(formData.date)) {
      toast({
        title: t("reservation.blockedDayTitle") || "Dia indisponível",
        description:
          t("reservation.blockedDayDescription") ||
          "Não é possível reservar neste dia.",
        variant: "destructive",
      });
      return;
    }

    if (isTimeBlocked(formData.date, formData.time)) {
      toast({
        title: t("reservation.blockedTimeTitle") || "Horário indisponível",
        description:
          t("reservation.blockedTimeDescription") ||
          "Não é possível reservar neste horário.",
        variant: "destructive",
      });
      return;
    }

    // Verificar disponibilidade
    const availability = await checkAvailability(
      formData.date,
      formData.time,
      Number(formData.numberOfPeople),
      formData.tourType // passar o tipo de tour
    );

    if (!availability.isAvailable) {
      // Mostrar modal com horários alternativos
      setAvailabilityInfo({
        isOpen: true,
        requestedDate: formData.date,
        requestedTime: formData.time,
        requestedPeople: Number(formData.numberOfPeople),
        existingPeople: availability.existingReservations,
        maxCapacity: availability.maxCapacity,
        alternativeTimes: availability.alternativeTimes,
      });
      return;
    }

    // Se estiver disponível, continuar com a reserva
    await processReservation();
  };

  const processReservation = async () => {
    // Montar as variáveis para interpolação
    const selectedTour = tourTypes.find(
      (tour) => tour.id === formData.tourType
    );
    const variables = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tour_type: selectedTour?.name || "",
      reservation_date: formData.date,
      reservation_time: formData.time,
      number_of_people: formData.numberOfPeople,
      message: formData.message,
      total_price: selectedTour ? selectedTour.price.toString() : "",
      created_at: new Date().toLocaleString(i18n.language),
    };

    // Usar o template de mensagem do cliente
    let rawMessage = t("reservation.clientReservationMessage");
    if (
      !rawMessage ||
      rawMessage.includes("reservation.clientReservationMessage")
    ) {
      rawMessage = `Olá, gostaria de reservar o passeio '{{tour_type}}' para o dia {{reservation_date}} às {{reservation_time}} para {{number_of_people}} pessoas. Nome: {{name}}. {{message}}`;
    }

    // Interpolar a mensagem
    const message = interpolateMessage(rawMessage, variables);

    // Pré-registo no Supabase
    try {
      const { error } = await supabase.from("reservations").insert([
        {
          customer_name: formData.name,
<<<<<<< HEAD
          customer_email: (formData.email || "").trim(),
=======
          customer_email: formData.email,
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
          customer_phone: formData.phone,
          reservation_date: formData.date,
          reservation_time: formData.time,
          number_of_people: Number(formData.numberOfPeople),
          tour_type: formData.tourType,
          special_requests: formData.message,
          status: "pending",
          language: i18n.language, // Salvar o idioma do cliente
        },
      ]);
      if (error) {
        toast({
          title: "Erro ao registar reserva",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      // Enviar evento para Google Sheet
      try {
        const selectedTour = tourTypes.find(
          (tour) => tour.id === formData.tourType
        );
        await fetch(
          "https://script.google.com/macros/s/AKfycbzwLpUUq2LSSC_Lns6bQZWnAcZMB5ustr_mPXRkzaNTBZ9D50r9Occ_QCGcvKap4PTp/exec",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "reserva",
              tipo: "cliente",
              cliente: formData.name,
              email: formData.email,
              telefone: formData.phone,
              data: formData.date,
              hora: formData.time,
              percurso: selectedTour?.name || formData.tourType,
              numeroPessoas: formData.numberOfPeople,
              valorTotal: selectedTour ? selectedTour.price.toString() : "",
              mensagem: formData.message,
              estado: "Pendente",
              condutor: "",
              observacoes: "Reserva criada pelo cliente",
            }),
          }
        );
      } catch (err) {
        console.error("Erro ao enviar evento Google Sheet:", err);
      }
    } catch (err) {
      toast({
        title: "Erro ao registar reserva",
        description: err.message,
        variant: "destructive",
      });
      return;
    }

    // Buscar condutor ativo
    let phoneNumber = "351968784043"; // fallback
    try {
      const activeConductors = await fetchActiveConductors(); // retorna array de IDs
      if (activeConductors.length > 0) {
        const conductor = allConductors.find(
          (c) => c.id === activeConductors[0]
        );
        if (conductor) phoneNumber = conductor.whatsapp;
      }
    } catch (e) {
      // fallback já definido
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    toast({
      title: t("reservation.reservationSent"),
      description: t("reservation.reservationDescription"),
    });
  };

  const handleSelectAlternative = (alternativeTime: string) => {
    // Atualizar o formulário com o horário alternativo
    setFormData((prev) => ({ ...prev, time: alternativeTime }));
    setAvailabilityInfo((prev) => ({ ...prev, isOpen: false }));

    // Processar a reserva com o novo horário
    setTimeout(() => {
      processReservation();
    }, 100);
  };

  const handleCloseModal = () => {
    setAvailabilityInfo((prev) => ({ ...prev, isOpen: false }));
  };

  const checkAvailabilityInRealTime = async () => {
    if (!formData.date || !formData.time || !formData.numberOfPeople) {
      setAvailabilityStatus({
        isChecking: false,
        isAvailable: true,
        existingPeople: 0,
        maxCapacity: 4,
        message: "",
      });
      return;
    }

    setAvailabilityStatus((prev) => ({ ...prev, isChecking: true }));

    try {
      const availability = await checkAvailability(
        formData.date,
        formData.time,
        Number(formData.numberOfPeople)
      );

      setAvailabilityStatus({
        isChecking: false,
        isAvailable: availability.isAvailable,
        existingPeople: availability.existingReservations,
        maxCapacity: availability.maxCapacity,
        message: availability.message,
      });
    } catch (error) {
      setAvailabilityStatus({
        isChecking: false,
        isAvailable: true,
        existingPeople: 0,
        maxCapacity: 4,
        message: "Erro ao verificar disponibilidade",
      });
    }
  };

  // Verificar disponibilidade quando mudar data, hora, número de pessoas OU tipo de tour
  React.useEffect(() => {
    // Só verifica se o tour já foi escolhido
    if (
      !formData.date ||
      !formData.time ||
      !formData.numberOfPeople ||
      !formData.tourType
    ) {
      setAvailabilityStatus({
        isChecking: false,
        isAvailable: true,
        existingPeople: 0,
        maxCapacity: 1,
        message: "",
      });
      return;
    }
    const timeoutId = setTimeout(() => {
      checkAvailabilityInRealTime();
    }, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [
    formData.date,
    formData.time,
    formData.numberOfPeople,
    formData.tourType,
  ]);

  // Abrir o modal de sugestão imediatamente após a verificação de disponibilidade, se necessário
  React.useEffect(() => {
    if (
      !availabilityStatus.isChecking &&
      !availabilityStatus.isAvailable &&
      availabilityStatus.alternativeTimes &&
      availabilityStatus.alternativeTimes.length > 0 &&
      formData.tourType
    ) {
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
  }, [availabilityStatus, formData.tourType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-900 font-semibold">
                {t("reservation.name")} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="border-2 border-blue-100 focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-900 font-semibold">
<<<<<<< HEAD
                {t("reservation.email")}
=======
                {t("reservation.email")} *
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
<<<<<<< HEAD
=======
                required
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
                className="border-2 border-blue-100 focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-blue-900 font-semibold">
                {t("reservation.phone")} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="border-2 border-blue-100 focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="numberOfPeople"
                className="text-blue-900 font-semibold flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {t("reservation.numberOfPeople")}
              </Label>
              <Select
                value={formData.numberOfPeople}
                onValueChange={(value) =>
                  handleInputChange("numberOfPeople", value)
                }
              >
                <SelectTrigger className="border-2 border-blue-100 focus:border-amber-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("reservation.people1")}</SelectItem>
                  <SelectItem value="2">{t("reservation.people2")}</SelectItem>
                  <SelectItem value="3">{t("reservation.people3")}</SelectItem>
                  <SelectItem value="4">{t("reservation.people4")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-blue-900 font-semibold">
                {t("reservation.date")} *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
                className="border-2 border-blue-100 focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="time"
                className="text-blue-900 font-semibold flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {t("reservation.time")} *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
                className="border-2 border-blue-100 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Status de Disponibilidade */}
          {formData.date &&
            formData.time &&
            formData.numberOfPeople &&
            formData.tourType && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">
                    Status de Disponibilidade
                  </h4>
                  {availabilityStatus.isChecking ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Verificando...</span>
                    </div>
                  ) : (
                    <Badge
                      variant={
                        availabilityStatus.isAvailable
                          ? "default"
                          : "destructive"
                      }
                      className={
                        availabilityStatus.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {availabilityStatus.isAvailable
                        ? "Disponível"
                        : "Indisponível"}
                    </Badge>
                  )}
                </div>

                {!availabilityStatus.isChecking && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        Pessoas já reservadas:{" "}
                        {availabilityStatus.existingPeople} /{" "}
                        {availabilityStatus.maxCapacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        Sua reserva: {formData.numberOfPeople} pessoas
                      </span>
                    </div>
                    {availabilityStatus.message && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {availabilityStatus.message}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="tourType" className="text-blue-900 font-semibold">
              {t("reservation.tourType")} *
            </Label>
            <Select
              value={formData.tourType}
              onValueChange={(value) => handleInputChange("tourType", value)}
              required
            >
              <SelectTrigger className="border-2 border-blue-100 focus:border-amber-400">
                <SelectValue placeholder={t("reservation.selectTour")} />
              </SelectTrigger>
              <SelectContent>
                {tourTypes.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id}>
                    {tour.name} - €{tour.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-blue-900 font-semibold">
              {t("reservation.message")}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder={t("reservation.messagePlaceholder")}
              className="border-2 border-blue-100 focus:border-amber-400"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
            disabled={!formData.tourType}
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            {t("reservation.confirmWhatsApp")}
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
