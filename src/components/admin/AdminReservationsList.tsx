import React, { useState } from "react";
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

const AdminReservationsList = () => {
  const { reservations, updateReservation, isUpdating } =
    useAdminReservations();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
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
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const tourTypes = [
    { id: "panoramic", name: "Passeio panorâmico pela vila" },
    { id: "furnas", name: "Vila Nova de Milfontes → Praia das Furnas" },
    { id: "bridge", name: "Travessia da ponte" },
    { id: "sunset", name: "Pôr do Sol Romântico" },
    { id: "night", name: "Passeio noturno" },
    { id: "fishermen", name: "Rota dos Pescadores" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

  const filteredReservations =
    reservations?.filter((reservation) => {
      const matchesSearch =
        reservation.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.customer_email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.tour_type.toLowerCase().includes(searchTerm.toLowerCase());

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
    }) || [];

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateReservation({ id, status: newStatus });
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
      const mensagem = i18next.getFixedT(lang)(
        `reservation.whatsappMessages.${reservation.status}`,
        {
          name: reservation.customer_name,
        }
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestão de Reservas
          </CardTitle>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome, email ou tour..."
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
          <div className="rounded-md border">
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
                {filteredReservations.length === 0 ? (
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
                  filteredReservations.map((reservation) => (
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
                        <p className="font-medium">{reservation.tour_type}</p>
                        {reservation.special_requests && (
                          <p className="text-sm text-gray-600 italic">
                            "{reservation.special_requests}"
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
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
                          {reservation.total_price}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reservation.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {getActionButtons(reservation)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminReservationsList;
