import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Map,
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  Star,
  Users,
  Phone,
  Clock,
  Shield,
  Camera,
  Waves,
  Euro,
  X,
  Facebook,
  Instagram,
  Twitter,
  CreditCard,
  Mail,
} from "lucide-react";
import MilfontesLeafletMap from "@/components/MilfontesLeafletMap";
import ReservationForm from "@/components/ReservationForm";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import LanguageSelector from "@/components/LanguageSelector";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import VideoModal from "../components/VideoModal";
// (optional) ResponsiveImage was removed during cleanup as it's not used here

const Index = () => {
  console.log("Index component rendering");
  const { t } = useTranslation();

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const testimonials = [
    {
      name: "Ana Silva",
      designation: "Lisboa",
      quote:
        "Melhor experiência da viagem! Meus filhos adoraram conhecer as praias secretas. O guia foi fantástico!",
      src: "https://tuktuk-milfontes.vercel.app/lovable-uploads/93176928-185a-4123-a668-0265acd3725f.png",
    },
    {
      name: "João Santos",
      designation: "Porto",
      quote:
        "Passeio incrível! O tuk-tuk é super confortável e as vistas são de tirar o fôlego. Recomendo 100%!",
      src: "https://tuktuk-milfontes.vercel.app/lovable-uploads/eb7253f4-32c5-4b77-b601-ca5c98ed6698.png",
    },
    {
      name: "Maria Costa",
      designation: "Coimbra",
      quote:
        "Serviço profissional e muito divertido. As crianças não pararam de sorrir durante todo o passeio!",
      src: "https://tuktuk-milfontes.vercel.app/lovable-uploads/70d09abb-337a-4ef7-b00a-91cb31b4c844.png",
    },
    {
      name: "Experiência Única",
      designation: "Milfontes",
      quote:
        "Descobrimos lugares incríveis que nunca encontraríamos sozinhos. Uma experiência inesquecível!",
      src: "https://tuktuk-milfontes.vercel.app/lovable-uploads/84b72700-6433-4531-900d-07efa0e27900.png",
    },
    {
      name: "Família Feliz",
      designation: "Aventura",
      quote:
        "Os tuk-tuks são modernos e seguros. Toda a família se divertiu muito durante o passeio!",
      src: "https://tuktuk-milfontes.vercel.app/lovable-uploads/796db528-2314-421e-a595-cb48f9156d79.png",
    },
    {
      name: "Diversão Garantida",
      designation: "Carnaval",
      quote:
        "Até nos eventos especiais, o serviço é impecável. Diversão e alegria em cada momento!",
      src: "https://tuktuk-milfontes.vercel.app/lovable-uploads/365cc092-1790-4b63-a689-2a9b96502d5e.png",
    },
  ];

  const tourTypes = [
    {
      id: "panoramic",
      name: t("tours.panoramic.title"),
      price: 10,
      duration: t("tours.panoramic.duration"),
      description: t("tours.panoramic.description"),
    },
    {
      id: "furnas",
      name: t("tours.furnas.title"),
      price: 14,
      duration: t("tours.furnas.duration"),
      description: t("tours.furnas.description"),
    },
    {
      id: "bridge",
      name: t("tours.bridge.title"),
      price: 10,
      duration: t("tours.bridge.duration"),
      description: t("tours.bridge.description"),
    },
    {
      id: "sunset",
      name: t("tours.sunset.title"),
      price: 25,
      duration: t("tours.sunset.duration"),
      description: t("tours.sunset.description"),
    },
    {
      id: "night",
      name: t("tours.night.title"),
      price: 8,
      duration: t("tours.night.duration"),
      description: t("tours.night.description"),
    },
    {
      id: "fishermen",
      name: t("tours.fishermen.title"),
      price: 10,
      duration: t("tours.fishermen.duration"),
      description: t("tours.fishermen.description"),
    },
  ];

  const handleWhatsAppContact = () => {
    const message = t("reservation.simpleContactMessage");
    const phoneNumber = "351968784043";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="h-screen-safe bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Language Selector */}
      <LanguageSelector />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-screen-safe max-h-[95vh] flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-y-auto"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-transparent"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://tuktuk-milfontes.vercel.app/lovable-uploads/c772d42e-6be5-4512-b5cd-e797cb242fe4.png')",
          }}
        ></div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="animate-fade-in">
            {/* Logo Section */}
            <div className="mb-4 sm:mb-8 flex justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-amber-400 shadow-2xl bg-white/90 backdrop-blur-sm p-2 hover:scale-105 transition-transform duration-300">
                <img
                  alt="TukTuk Milfontes Logo"
                  className="w-full h-full object-contain rounded-full"
                  src="https://tuktuk-milfontes.vercel.app/lovable-uploads/cf00ebfe-2e98-4eb0-bc91-d80954178a9f.png"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl md:text-6xl lg:text-8xl text-white mb-4 sm:mb-6 leading-tight">
              {t("hero.title")}
              <br />
              <span className="text-amber-400">{t("hero.subtitle")}</span>
              <span className="text-6xl md:text-8xl ml-4">🛺✨</span>
            </h1>

            <p className="text-lg md:text-2xl lg:text-3xl text-blue-100 mb-4 sm:mb-8 font-medium max-w-4xl mx-auto leading-relaxed">
              {t("hero.description")}
              <span className="text-amber-300 font-semibold">
                {" "}
                {t("hero.descriptionHighlight")}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Dialog
                open={isReservationModalOpen}
                onOpenChange={setIsReservationModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 transform"
                  >
                    {t("hero.reserveNow")} →
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      Formulário de Reserva
                    </DialogTitle>
                  </DialogHeader>
                  <ReservationForm />
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-2 text-blue-100">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                <span className="font-semibold">{t("hero.rating")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              {t("benefits.title")}{" "}
              <span className="text-amber-500">
                {t("benefits.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("benefits.subtitle")}
            </p>
          </div>

          {/* Image Gallery */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="relative">
              <img
                src="https://tuktuk-milfontes.vercel.app/lovable-uploads/bc9c590b-26bf-4d4d-a27c-3e917afef291.png"
                alt="Nosso Tuk-Tuk ao pôr do sol em Milfontes"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Experiência Única</h3>
                <p className="text-sm">Paisagens deslumbrantes ao pôr do sol</p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://tuktuk-milfontes.vercel.app/lovable-uploads/ddc85a0b-4a74-44e3-a0a6-bed937a5a686.png"
                alt="Tuk-Tuk com cobertura contra chuva"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Proteção Climática</h3>
                <p className="text-sm">
                  Capota retrátil e proteção contra chuva
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Map className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  {t("benefits.exclusiveRoutes.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t("benefits.exclusiveRoutes.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  {t("benefits.familyComfort.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t("benefits.familyComfort.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  {t("benefits.quickReservation.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t("benefits.quickReservation.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="tours"
        className="py-20 px-4 bg-gradient-to-br from-amber-50 to-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              <Euro className="inline-block w-12 h-12 mr-4 text-amber-500" />
              {t("pricing.title")}{" "}
              <span className="text-amber-500">
                {t("pricing.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {tourTypes.map((tour, index) => (
              <Card
                key={tour.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">
                      €{tour.price}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {tour.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-amber-100 text-amber-800"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {tour.duration}
                  </Badge>
                  <p className="text-gray-600 mb-6">{tour.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>
                      {t("pricing.upTo2People")}:{" "}
                      <span className="font-semibold text-amber-600">
                        €{tour.price}
                      </span>
                    </p>
                    <p>
                      {t("pricing.additionalPeople")}:{" "}
                      <span className="font-semibold text-amber-600">
                        +€3.50
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Dialog
              open={isPricingModalOpen}
              onOpenChange={setIsPricingModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300"
                >
                  {t("pricing.seeDetailedPrices")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                      <Euro className="w-8 h-8 text-amber-500" />
                      {t("pricing.detailedPricesTitle")}
                    </DialogTitle>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-blue-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">
                      {t("pricing.howPricesWork")}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">
                          {t("pricing.basePrice")}
                        </h4>
                        <p className="text-gray-600">
                          {t("pricing.basePriceDesc")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">
                          {t("pricing.additionalPeople")}
                        </h4>
                        <p className="text-gray-600">
                          {t("pricing.additionalPeopleDesc")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {tourTypes.map((tour) => (
                      <div
                        key={tour.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-blue-900">
                              {tour.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {tour.description}
                            </p>
                            <Badge
                              variant="secondary"
                              className="mt-2 bg-blue-100 text-blue-800"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {tour.duration}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-600">
                              €{tour.price}
                            </div>
                            <div className="text-sm text-gray-500">
                              {t("pricing.upTo2People")}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-sm text-gray-700 mb-2">
                            {t("pricing.priceExamples")}
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-blue-900">
                                1 {t("pricing.person")}
                              </div>
                              <div className="text-amber-600">
                                €{tour.price}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-900">
                                2 {t("pricing.people")}
                              </div>
                              <div className="text-amber-600">
                                €{tour.price}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-900">
                                3 {t("pricing.people")}
                              </div>
                              <div className="text-amber-600">
                                €{tour.price + 3.5}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-900">
                                4 {t("pricing.people")}
                              </div>
                              <div className="text-amber-600">
                                €{tour.price + 7}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-6 border-t">
                    <Dialog
                      open={isReservationModalOpen}
                      onOpenChange={setIsReservationModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="lg"
                          className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
                        >
                          {t("pricing.makeReservation")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="sr-only">
                            Formulário de Reserva
                          </DialogTitle>
                        </DialogHeader>
                        <ReservationForm />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              <MapPin className="inline-block w-12 h-12 mr-4 text-amber-500" />
              {t("map.title")}{" "}
              <span className="text-amber-500">{t("map.titleHighlight")}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("map.subtitle")}
            </p>
          </div>

          <MilfontesLeafletMap />
        </div>
      </section>

      {/* TukTuk Tracking Button Section */}
      <section
        id="real-time-tracking-section"
        className="py-12 px-4 bg-gradient-to-br from-amber-50 to-blue-50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
            {t("realTimeTracking.title")}
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("realTimeTracking.description")}
          </p>
          <a
            href="/tracking"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {t("realTimeTracking.buttonText")}
          </a>
        </div>
      </section>

      {/* Explore Milfontes Section */}
      <section
        id="explore-section"
        className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              {t("explore.title")}{" "}
              <span className="text-amber-500">
                {t("explore.titleHighlight")}
              </span>{" "}
              {t("explore.subtitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("explore.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="relative">
              <img
                src="https://tuktuk-milfontes.vercel.app/lovable-uploads/47a59b02-cbe5-4103-ac4c-ea39946a7b96.png"
                alt="Vista aérea de Vila Nova de Milfontes"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {t("explore.panoramicView")}
                </h3>
                <p className="text-lg">{t("explore.panoramicViewDesc")}</p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://tuktuk-milfontes.vercel.app/lovable-uploads/a736c163-97f6-47cb-80c1-b2ed8d1bf580.png"
                alt="Forte de Vila Nova de Milfontes"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {t("explore.historicHeritage")}
                </h3>
                <p className="text-lg">{t("explore.historicHeritageDesc")}</p>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="text-center mb-8 flex justify-center">
            <div>
              <h3 className="text-3xl font-bold text-blue-900 mb-6">
                {t("aerialViewMilfontes.title")}
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
                {t("aerialViewMilfontes.description")}
              </p>
              <VideoModal />
              <div className="mt-6 text-sm text-gray-500 max-w-4xl mx-auto">
                <p>
                  Este vídeo é cortesia do canal{" "}
                  <a
                    href="https://www.youtube.com/@AndreInacio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 underline font-semibold"
                  >
                    AndreInacio
                  </a>
                  . Assista o vídeo original{" "}
                  <a
                    href="https://www.youtube.com/watch?v=6nlJW9-RiqM&t=29s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 underline font-semibold"
                  >
                    aqui: Vila Nova de Milfontes aerial view @Alentejo -
                    Portugal
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              {t("availability.title")}{" "}
              <span className="text-amber-500">
                {t("availability.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("availability.subtitle")}
            </p>
          </div>

          <AvailabilityCalendar />
        </div>
      </section>

      {/* Testimonials Section - Now with Animated Component */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              {t("testimonials.title")}{" "}
              <span className="text-amber-500">
                {t("testimonials.titleHighlight")}
              </span>
            </h2>
            <div className="flex justify-center items-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-amber-400 fill-current" />
              ))}
              <span className="text-xl font-semibold text-gray-700 ml-2">
                {t("testimonials.rating")}
              </span>
            </div>
          </div>

          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              {t("faq.title")}{" "}
              <span className="text-amber-500">{t("faq.titleHighlight")}</span>
            </h2>
            <p className="text-xl text-gray-600">{t("faq.subtitle")}</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem
              value="item-1"
              className="bg-white rounded-xl shadow-lg border-0 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-blue-900 hover:text-amber-600">
                {t("faq.q1")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pt-4">
                {t("faq.a1")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="bg-white rounded-xl shadow-lg border-0 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-blue-900 hover:text-amber-600">
                {t("faq.q2")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pt-4">
                {t("faq.a2")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="bg-white rounded-xl shadow-lg border-0 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-blue-900 hover:text-amber-600">
                {t("faq.q3")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pt-4">
                {t("faq.a3")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="bg-white rounded-xl shadow-lg border-0 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-blue-900 hover:text-amber-600">
                {t("faq.q4")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pt-4">
                {t("faq.a4")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="bg-white rounded-xl shadow-lg border-0 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-blue-900 hover:text-amber-600">
                {t("faq.q5")}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pt-4">
                {t("faq.a5")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t("cta.title")}{" "}
            <span className="text-amber-400">{t("cta.titleHighlight")}</span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Dialog
              open={isReservationModalOpen}
              onOpenChange={setIsReservationModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
                >
                  {t("cta.reserveNow")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="sr-only">
                    Formulário de Reserva
                  </DialogTitle>
                </DialogHeader>
                <ReservationForm />
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="lg"
              onClick={handleWhatsAppContact}
              className="border-2 border-white hover:bg-white font-bold text-xl px-12 py-6 rounded-2xl transition-all duration-300 text-blue-700"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              {t("cta.talkToUs")}
            </Button>
          </div>

          <div className="flex justify-center items-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>{t("cta.phone")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{t("cta.schedule")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Share Section */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Partilhe esta experiência!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Ajude-nos a crescer e inspire outros a descobrir Milfontes de tuk
            tuk. Siga-nos ou partilhe nas redes sociais:
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <a
              href="https://www.facebook.com/share/192HyZevo9/"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              className="hover:scale-110 transition-transform"
            >
              <Facebook className="w-12 h-12 text-blue-600 hover:text-blue-800" />
            </a>
            <a
              href="https://www.instagram.com/tuktuk.milfontes?igsh=MXIwc3c2YjZuNHpoeA=="
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="hover:scale-110 transition-transform"
            >
              <Instagram className="w-12 h-12 text-pink-500 hover:text-pink-700" />
            </a>
            <a
              href="https://www.youtube.com/watch?v=j6863SgA9fQ"
              target="_blank"
              rel="noopener"
              aria-label="YouTube"
              className="hover:scale-110 transition-transform"
            >
              <svg
                className="w-12 h-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.12C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.386.566a2.994 2.994 0 0 0-2.112 2.12C0 8.355 0 12 0 12s0 3.645.502 5.814a2.994 2.994 0 0 0 2.112 2.12C4.772 20.5 12 20.5 12 20.5s7.228 0 9.386-.566a2.994 2.994 0 0 0 2.112-2.12C24 15.645 24 12 24 12s0-3.645-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-blue-950 text-blue-100 border-t border-blue-900 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-amber-400">
              {t("footer.contactTitle")}
            </h3>
            <p className="mb-1">
              <MapPin className="inline w-4 h-4 mr-1 text-amber-400" />
              Lugar da Boavista, cx postal 2510, Foros do Freixial - 7645-037
              Vila Nova de Milfontes
            </p>
            <p className="mb-1">
              <Phone className="inline w-4 h-4 mr-1 text-amber-400" />
              963 496 320
            </p>
            <p className="mb-1">
              <Mail className="inline w-4 h-4 mr-1 text-amber-400" />
              diogo.carias@outlook.pt
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-amber-400">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-1">
              <li>
                <a href="/#hero" className="hover:underline">
                  {t("footer.linkHome")}
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:underline">
                  {t("footer.linkAbout")}
                </a>
              </li>
              <li>
                <a href="/#tours" className="hover:underline">
                  {t("footer.linkServices")}
                </a>
              </li>
              <li>
                <a href="/#reservation" className="hover:underline">
                  {t("footer.linkBooking")}
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:underline">
                  {t("footer.linkFAQ")}
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" className="hover:underline">
                  {t("footer.linkSitemap")}
                </a>
              </li>
            </ul>
          </div>

          {/* Políticas e legais */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-amber-400">
              {t("footer.policies")}
            </h3>
            <ul className="space-y-1">
              <li>
                <a href="/TermosCondicoes" className="hover:underline">
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a href="/PoliticaPrivacidade" className="hover:underline">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="/PoliticaCancelamento" className="hover:underline">
                  {t("footer.cancellation")}
                </a>
              </li>
            </ul>
            <h3 className="text-lg font-bold mt-4 mb-2 text-amber-400">
              {t("footer.legalInfo")}
            </h3>
            <p className="mb-1">NIF: 237319594</p>
            <p className="mb-1">RNAAT: 438/2025</p>
            <p className="mb-1">{t("footer.licenseInfo")}</p>
          </div>

          {/* Redes sociais, newsletter, pagamentos, créditos */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-amber-400">
              {t("footer.followUs")}
            </h3>
            <div className="flex gap-3 mb-4">
              <a
                href="https://www.facebook.com/share/192HyZevo9/"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="hover:text-amber-400"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/tuktuk.milfontes?igsh=MXIwc3c2YjZuNHpoeA=="
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="hover:text-amber-400"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/qr/CMOIHHQFEY5NC1"
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className="hover:text-amber-400"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-4">
              <a
                href="/tracking"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                📍 Ver TukTuk em Tempo Real
              </a>
            </div>
            <h3 className="text-lg font-bold mb-2 text-amber-400">
              {t("footer.paymentInfo")}
            </h3>
            <div className="flex gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-blue-900 rounded text-xs font-semibold">
                Mbway
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-blue-900 rounded text-xs font-semibold">
                Dinheiro
              </span>
            </div>
            <p className="text-xs mb-2">{t("footer.paymentSecurity")}</p>
            <h3 className="text-lg font-bold mb-2 text-amber-400">
              {t("footer.credits")}
            </h3>
            <p className="text-xs mb-2">{t("footer.copyright")}</p>
            <p className="text-xs mb-2">{t("footer.attributions")}</p>
            <a
              href="mailto:diogo.carias@outlook.pt"
              className="text-xs underline hover:text-amber-400"
            >
              {t("footer.support")}
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 border-t border-blue-900 pt-4 text-center text-blue-400 text-xs">
          <div className="flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {t("footer.insurance")}
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              {t("footer.photos")}
            </span>
            <span className="flex items-center gap-1">
              <Waves className="w-4 h-4" />
              {t("footer.localGuides")}
            </span>
          </div>
          <div
            className="flex flex-col items-center mt-6 gap-2 p-4 rounded-lg"
            style={{ background: "#FBBF24" }}
          >
            <span className="font-bold text-blue-900 text-lg mb-1">
              Site desenvolvido por:
            </span>
            <span className="font-semibold text-blue-900 text-xl">
              Carlos Barradas
            </span>
            <span className="text-blue-900 text-lg">
              Email:{" "}
              <a
                href="mailto:carlosbarradas@gmail.com"
                className="underline hover:text-blue-800"
              >
                carlosbarradas@gmail.com
              </a>
            </span>
            <span className="text-blue-900 text-lg">
              WhatsApp:{" "}
              <a
                href="https://wa.me/351965758022"
                target="_blank"
                rel="noopener"
                className="underline hover:text-blue-800"
              >
                351 965 758 022
              </a>
            </span>
            <span className="text-blue-900 text-lg">
              Site:{" "}
              <a
                href="https://carlosbarradas.com/gestor-de-anuncios/"
                target="_blank"
                rel="noopener"
                className="underline hover:text-blue-800"
              >
                carlosbarradas.com
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
