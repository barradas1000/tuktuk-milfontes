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
import { Calendar, Users, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const { toast } = useToast();

  const tourTypes = [
    { id: "panoramic", name: t("tours.panoramic.title"), price: 10 },
    { id: "furnas", name: t("tours.furnas.title"), price: 14 },
    { id: "bridge", name: t("tours.bridge.title"), price: 10 },
    { id: "sunset", name: t("tours.sunset.title"), price: 25 },
    { id: "night", name: t("tours.night.title"), price: 8 },
    { id: "fishermen", name: t("tours.fishermen.title"), price: 10 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Gerar mensagem WhatsApp
    const selectedTour = tourTypes.find(
      (tour) => tour.id === formData.tourType
    );
    const message = `${t("reservation.title")}:
    \n📅 ${t("reservation.date")}: ${formData.date}
⏰ ${t("reservation.time")}: ${formData.time}
🛺 ${t("reservation.tourType")}: ${selectedTour?.name || "Não especificado"}
👥 ${t("reservation.numberOfPeople")}: ${formData.numberOfPeople}
👤 ${t("reservation.name")}: ${formData.name}
📧 ${t("reservation.email")}: ${formData.email}
📱 ${t("reservation.phone")}: ${formData.phone}
💬 ${t("reservation.message")}: ${formData.message}`;

    // Pré-registo no Supabase
    try {
      const { error } = await supabase.from("reservations").insert([
        {
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          reservation_date: formData.date,
          reservation_time: formData.time,
          number_of_people: Number(formData.numberOfPeople),
          tour_type: formData.tourType,
          special_requests: formData.message,
          status: "pending",
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
    } catch (err) {
      toast({
        title: "Erro ao registar reserva",
        description: err.message,
        variant: "destructive",
      });
      return;
    }

    // Abrir WhatsApp normalmente
    const phoneNumber = "351968784043";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    toast({
      title: t("reservation.reservationSent"),
      description: t("reservation.reservationDescription"),
    });
  };

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
                {t("reservation.email")} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
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
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            {t("reservation.confirmWhatsApp")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;
