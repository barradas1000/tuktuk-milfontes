import { AdminReservation } from "@/types/adminReservations";

export const mockReservations: AdminReservation[] = [
  {
    id: "1",
    customer_name: "João Silva",
    customer_email: "joao@email.com",
    customer_phone: "+351 912 345 678",
    reservation_date: new Date().toISOString().split("T")[0],
    reservation_time: "10:30",
    number_of_people: 2,
    tour_type: "panoramic",
    special_requests: "Fotografias incluídas",
    status: "pending",
    total_price: 20, // 2 pessoas × €10
    created_at: new Date().toISOString(),
    manual_payment: 25,
  },
  {
    id: "2",
    customer_name: "Maria Santos",
    customer_email: "maria@email.com",
    customer_phone: "+351 963 789 012",
    reservation_date: new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0], // tomorrow
    reservation_time: "14:00",
    number_of_people: 4,
    tour_type: "furnas",
    status: "confirmed",
    total_price: 60, // 4 pessoas × €15
    created_at: new Date().toISOString(),
    // manual_payment intentionally omitted
  },
  {
    id: "3",
    customer_name: "Carlos Oliveira",
    customer_email: "carlos@email.com",
    customer_phone: "+351 925 123 456",
    reservation_date: new Date(Date.now() + 172800000)
      .toISOString()
      .split("T")[0], // day after tomorrow
    reservation_time: "17:00",
    number_of_people: 1,
    tour_type: "sunset",
    special_requests: "Quero ver o pôr do sol no melhor local",
    status: "confirmed",
    total_price: 12, // 1 pessoa × €12
    created_at: new Date().toISOString(),
    manual_payment: 15,
  },
  {
    id: "4",
    customer_name: "Ana Costa",
    customer_email: "ana@email.com",
    customer_phone: "+351 936 654 321",
    reservation_date: new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0], // yesterday
    reservation_time: "09:00",
    number_of_people: 3,
    tour_type: "fishermen",
    status: "completed",
    total_price: 48, // 3 pessoas × €16
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "5",
    customer_name: "Pedro Martins",
    customer_email: "pedro@email.com",
    customer_phone: "+351 918 987 654",
    reservation_date: new Date(Date.now() - 259200000)
      .toISOString()
      .split("T")[0], // 3 days ago
    reservation_time: "20:00",
    number_of_people: 2,
    tour_type: "night",
    status: "cancelled",
    total_price: 28, // 2 pessoas × €14
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

export const mockBlockedPeriods = [
  {
    id: "block-1",
    date: "2024-07-01",
    reason: "Manutenção",
    createdBy: "admin",
  },
  {
    id: "block-2",
    date: "2024-07-02",
    startTime: "12:00",
    endTime: "15:00",
    reason: "Almoço prolongado",
    createdBy: "admin",
  },
];
