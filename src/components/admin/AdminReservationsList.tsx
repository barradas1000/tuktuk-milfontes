import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Search,
  Filter,
  Clock,
  Users,
  Euro,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { AdminReservation } from "@/types/adminReservations";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { checkAvailability } from "@/services/availabilityService";
import { useNavigate } from "react-router-dom";

const AdminReservationsList = () => {
  const {
    reservations,
    updateReservation,
    updateManualPayment,
    isUpdating,
    refetch,
  } = useAdminReservations();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    tourType: "",
    numberOfPeople: "2",
    message: "",
    totalPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [manualPaymentValue, setManualPaymentValue] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<AdminReservation | null>(null);
  const navigate = useNavigate();

  const tourTypes = [
    { id: "panoramic", name: "Passeio panorâmico pela vila", basePrice: 10 },
    {
      id: "furnas",
      name: "Vila Nova de Milfontes → Praia das Furnas",
      basePrice: 15,
    },
    { id: "bridge", name: "Travessia da ponte", basePrice: 8 },
    { id: "sunset", name: "Pôr do Sol Romântico", basePrice: 12 },
    { id: "night", name: "Passeio noturno", basePrice: 14 },
    { id: "fishermen", name: "Rota dos Pescadores", basePrice: 16 },
  ];

  // Função para calcular preço automaticamente
  const calculatePrice = (tourType: string, numberOfPeople: string) => {
    const tour = tourTypes.find((t) => t.id === tourType);
    if (!tour) return 0;

    const people = parseInt(numberOfPeople) || 1;
    return tour.basePrice * people;
  };

  // Função para traduzir tipos de tour para nomes amigáveis
  const getTourDisplayName = (tourType: string) => {
    const tour = tourTypes.find((t) => t.id === tourType);
    return tour ? tour.name : tourType;
  };

  // Função para obter o preço base do tour
  const getTourBasePrice = (tourType: string) => {
    const tour = tourTypes.find((t) => t.id === tourType);
    return tour ? tour.basePrice : 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Calcular preço automaticamente quando tour ou número de pessoas mudar
    if (field === "tourType" || field === "numberOfPeople") {
      const newTourType = field === "tourType" ? value : formData.tourType;
      const newNumberOfPeople =
        field === "numberOfPeople" ? value : formData.numberOfPeople;
      const calculatedPrice = calculatePrice(newTourType, newNumberOfPeople);
      setFormData((prev) => ({
        ...prev,
        totalPrice: calculatedPrice.toString(),
      }));
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar disponibilidade antes de criar a reserva
      const availability = await checkAvailability(
        formData.date,
        formData.time,
        Number(formData.numberOfPeople)
      );

      if (!availability.isAvailable) {
        toast({
          title: "Horário Indisponível",
          description: `Este horário já está reservado por outro cliente. Cada horário pode ter apenas uma reserva por vez.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

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
          total_price: Number(formData.totalPrice) || 0,
          status: "pending",
        },
      ]);
      if (error) {
        toast({
          title: "Erro ao adicionar reserva",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Reserva adicionada com sucesso" });
        setOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          date: "",
          time: "",
          tourType: "",
          numberOfPeople: "2",
          message: "",
          totalPrice: "",
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Erro ao adicionar reserva",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Constantes de paginação
  const ITEMS_PER_PAGE = 10;

  // Filtragem e ordenação das reservas
  const filteredAndSortedReservations = useMemo(() => {
    if (!reservations || reservations.length === 0) {
      return [];
    }

    const filtered = reservations.filter((reservation) => {
      const matchesSearch =
        reservation.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.customer_email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getTourDisplayName(reservation.tour_type)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      const today = new Date().toISOString().split("T")[0];
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = reservation.reservation_date === today;
      } else if (dateFilter === "upcoming") {
        matchesDate = reservation.reservation_date >= today;
      } else if (dateFilter === "past") {
        matchesDate = reservation.reservation_date < today;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Ordenar por data (mais recentes primeiro) e depois por hora
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(`${a.reservation_date} ${a.reservation_time}`);
      const dateB = new Date(`${b.reservation_date} ${b.reservation_time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return sorted;
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  // Calcular paginação
  const totalPages = Math.ceil(
    filteredAndSortedReservations.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReservations = filteredAndSortedReservations.slice(
    startIndex,
    endIndex
  );

  // Resetar página quando os filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Atualizar relógio a cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Função para formatar a data e hora atual
  const formatCurrentDateTime = () => {
    return format(currentTime, "dd/MM/yyyy HH:mm:ss", { locale: pt });
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateReservation({ id, status: newStatus });
  };

  const handleManualPaymentUpdate = async (id: string, value: number) => {
    try {
      // Use the mutation from the hook instead of direct supabase call
      updateManualPayment({ id, manualPayment: value });
      setEditingPayment(null);
      setManualPaymentValue("");
    } catch (err: unknown) {
      toast({
        title: "Erro ao atualizar pagamento",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  const startEditingPayment = (id: string, currentValue: number = 0) => {
    setEditingPayment(id);
    setManualPaymentValue(currentValue.toString());
  };

  const cancelEditingPayment = () => {
    setEditingPayment(null);
    setManualPaymentValue("");
  };

  const handleDeleteReservation = async (reservation: AdminReservation) => {
    setReservationToDelete(reservation);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;
    try {
      await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationToDelete.id);
      toast({ title: "Reserva eliminada com sucesso" });
      refetch(); // Atualizar a lista após eliminar
    } catch (err: unknown) {
      toast({
        title: "Erro ao eliminar reserva",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        icon: AlertCircle,
        text: "Pendente",
      },
      confirmed: {
        color: "bg-green-100 text-green-800 hover:bg-green-200",
        icon: CheckCircle,
        text: "Confirmada",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 hover:bg-red-200",
        icon: XCircle,
        text: "Cancelada",
      },
      completed: {
        color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        icon: CheckCircle,
        text: "Concluída",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.color} flex items-center gap-1 cursor-pointer transition-colors`}
      >
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getActionButtons = (reservation: AdminReservation) => {
    const buttons = [];

    // Botão WhatsApp
    if (reservation.customer_phone) {
      const lang = reservation.language || "pt";
      // Montar todas as variáveis relevantes para interpolação
      const variables = {
        name: reservation.customer_name,
        email: reservation.customer_email,
        phone: reservation.customer_phone,
        tour_type: getTourDisplayName(reservation.tour_type),
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        number_of_people: reservation.number_of_people?.toString() || "",
        message: reservation.special_requests || "",
        total_price: reservation.total_price?.toString() || "",
        created_at: reservation.created_at
          ? new Date(reservation.created_at).toLocaleString(lang)
          : "",
      };
      const mensagem = i18next.getFixedT(lang)(
        `reservation.whatsappMessages.${reservation.status}`,
        variables
      );
      buttons.push(
        <Button
          key="whatsapp"
          size="sm"
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50"
          onClick={() =>
            window.open(
              `https://wa.me/${
                reservation.customer_phone
              }?text=${encodeURIComponent(mensagem)}`,
              "_blank"
            )
          }
        >
          <Phone className="h-3 w-3 mr-1" />
          WhatsApp
        </Button>
      );
    }

    if (reservation.status === "pending") {
      buttons.push(
        <Button
          key="confirm"
          size="sm"
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => handleStatusUpdate(reservation.id, "confirmed")}
          disabled={isUpdating}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmar
        </Button>
      );
    }

    if (
      reservation.status !== "cancelled" &&
      reservation.status !== "completed"
    ) {
      buttons.push(
        <Button
          key="cancel"
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => handleStatusUpdate(reservation.id, "cancelled")}
          disabled={isUpdating}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Cancelar
        </Button>
      );
    }

    if (reservation.status === "confirmed") {
      buttons.push(
        <Button
          key="complete"
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => handleStatusUpdate(reservation.id, "completed")}
          disabled={isUpdating}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Concluir
        </Button>
      );
    }

    return buttons;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Adicionar Reserva</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div>
                <Label>Hora *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
              <div>
                <Label>Tipo de Tour *</Label>
                <Select
                  value={formData.tourType}
                  onValueChange={(value) =>
                    handleInputChange("tourType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {tourTypes.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nº de Pessoas *</Label>
                <Select
                  value={formData.numberOfPeople}
                  onValueChange={(value) =>
                    handleInputChange("numberOfPeople", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Total (€) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalPrice}
                    onChange={(e) =>
                      handleInputChange("totalPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className="flex-1"
                  />
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {formData.tourType && formData.numberOfPeople && (
                      <span>
                        (€
                        {calculatePrice(
                          formData.tourType,
                          formData.numberOfPeople
                        ).toFixed(2)}
                        )
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valor calculado automaticamente baseado no tour e número de
                  pessoas
                </p>
              </div>
              <div className="md:col-span-2">
                <Label>Mensagem</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Aguarde..." : "Adicionar Reserva"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gestão de Reservas
            </CardTitle>
            <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">{formatCurrentDateTime()}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome, email ou tipo de tour..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="upcoming">Futuras</SelectItem>
                <SelectItem value="past">Passadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Responsivo: Cards em mobile, tabela em desktop */}
          <div className="block lg:hidden">
            {currentReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma reserva encontrada</p>
              </div>
            ) : (
              currentReservations.map((reservation, idx) => {
                // Alternar cor de fundo
                const bgColors = [
                  "bg-gray-50",
                  "bg-blue-50",
                  "bg-green-50",
                  "bg-purple-50",
                  "bg-yellow-50",
                ];
                const bg = bgColors[idx % bgColors.length];
                return (
                  <div
                    key={reservation.id}
                    className={`mb-4 p-4 rounded-xl border shadow-sm ${bg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">
                        {reservation.customer_name}
                      </span>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <div className="flex flex-col gap-1 text-sm mb-2">
                      <span>
                        <Phone className="inline h-4 w-4 mr-1 text-gray-400" />{" "}
                        {reservation.customer_phone}
                      </span>
                      <span>
                        <Mail className="inline h-4 w-4 mr-1 text-gray-400" />{" "}
                        {reservation.customer_email}
                      </span>
                      <span>
                        <Users className="inline h-4 w-4 mr-1 text-gray-400" />{" "}
                        {reservation.number_of_people} pessoas
                      </span>
                      <span>
                        <Clock className="inline h-4 w-4 mr-1 text-gray-400" />{" "}
                        {format(
                          new Date(reservation.reservation_date),
                          "dd/MM/yyyy",
                          { locale: pt }
                        )}{" "}
                        às {reservation.reservation_time}
                      </span>
                      <span>
                        <b>Tour:</b> {getTourDisplayName(reservation.tour_type)}{" "}
                        <span className="text-xs text-gray-500">
                          (Base: €
                          {getTourBasePrice(reservation.tour_type).toFixed(2)})
                        </span>
                      </span>
                      {reservation.special_requests && (
                        <span className="italic text-gray-600">
                          "{reservation.special_requests}"
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <Euro className="h-4 w-4 text-gray-400" />
                      {editingPayment === reservation.id ? (
                        <>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={manualPaymentValue}
                            onChange={(e) =>
                              setManualPaymentValue(e.target.value)
                            }
                            className="w-24 mr-2"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mr-1"
                            onClick={() =>
                              handleManualPaymentUpdate(
                                reservation.id,
                                parseFloat(manualPaymentValue)
                              )
                            }
                            disabled={
                              manualPaymentValue === "" ||
                              isNaN(Number(manualPaymentValue))
                            }
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingPayment}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          {typeof reservation.manual_payment === "number"
                            ? (reservation.manual_payment || 0).toFixed(2)
                            : (reservation.total_price || 0).toFixed(2)}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={() =>
                              startEditingPayment(
                                reservation.id,
                                reservation.manual_payment ??
                                  (reservation.total_price || 0)
                              )
                            }
                          >
                            Editar
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getActionButtons(reservation)}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteReservation(reservation)}
                      >
                        Eliminar Reserva
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Tabela tradicional em desktop */}
          <div className="hidden lg:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Pessoas</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentReservations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma reserva encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">
                            {reservation.customer_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {reservation.customer_phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            {reservation.customer_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {getTourDisplayName(reservation.tour_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Base: €
                            {getTourBasePrice(reservation.tour_type).toFixed(2)}
                          </p>
                          {reservation.special_requests && (
                            <p className="text-sm text-gray-600 italic mt-1">
                              "{reservation.special_requests}"
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-gray-500">
                            Feita em:{" "}
                            {reservation.created_at
                              ? format(
                                  new Date(reservation.created_at),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: pt }
                                )
                              : "—"}
                          </p>
                          <p className="font-medium">
                            {format(
                              new Date(reservation.reservation_date),
                              "dd/MM/yyyy",
                              { locale: pt }
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.reservation_time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {reservation.number_of_people}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold">
                          <Euro className="h-4 w-4 text-gray-400" />
                          {editingPayment === reservation.id ? (
                            <>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={manualPaymentValue}
                                onChange={(e) =>
                                  setManualPaymentValue(e.target.value)
                                }
                                className="w-24 mr-2"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="mr-1"
                                onClick={() =>
                                  handleManualPaymentUpdate(
                                    reservation.id,
                                    parseFloat(manualPaymentValue)
                                  )
                                }
                                disabled={
                                  manualPaymentValue === "" ||
                                  isNaN(Number(manualPaymentValue))
                                }
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditingPayment}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              {typeof reservation.manual_payment === "number"
                                ? (reservation.manual_payment || 0).toFixed(2)
                                : (reservation.total_price || 0).toFixed(2)}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-2"
                                onClick={() =>
                                  startEditingPayment(
                                    reservation.id,
                                    reservation.manual_payment ??
                                      (reservation.total_price || 0)
                                  )
                                }
                              >
                                Editar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reservation.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {getActionButtons(reservation)}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteReservation(reservation)}
                          >
                            Eliminar Reserva
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 border-t">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a{" "}
                {Math.min(endIndex, filteredAndSortedReservations.length)} de{" "}
                {filteredAndSortedReservations.length} reservas
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Popup de confirmação de eliminação */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p>
            Tem a certeza que deseja eliminar a reserva de{" "}
            <b>{reservationToDelete?.customer_name}</b>?
          </p>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDeleteReservation}>
              Eliminar
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Botão para instruções de uso */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => navigate("/instrucoes")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
        >
          Instruções de uso do sistema de reservas
        </button>
      </div>
    </>
  );
};

export default AdminReservationsList;
