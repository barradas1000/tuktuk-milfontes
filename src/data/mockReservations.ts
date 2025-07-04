
import { AdminReservation } from '@/types/adminReservations';

export const mockReservations: AdminReservation[] = [
  {
    id: '1',
    customer_name: 'João Silva',
    customer_email: 'joao@email.com',
    customer_phone: '+351 912 345 678',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '10:30',
    number_of_people: 2,
    tour_type: 'Panoramic village tour',
    special_requests: 'Fotografias incluídas',
    status: 'pending',
    total_price: 20,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    customer_name: 'Maria Santos',
    customer_email: 'maria@email.com',
    customer_phone: '+351 963 789 012',
    reservation_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    reservation_time: '14:00',
    number_of_people: 4,
    tour_type: 'Vila Nova de Milfontes → Furnas Beach',
    status: 'confirmed',
    total_price: 21,
    created_at: new Date().toISOString()
  }
];

export const mockBlockedPeriods = [
  {
    id: 'block-1',
    date: '2024-07-01',
    reason: 'Manutenção',
    createdBy: 'admin',
  },
  {
    id: 'block-2',
    date: '2024-07-02',
    startTime: '12:00',
    endTime: '15:00',
    reason: 'Almoço prolongado',
    createdBy: 'admin',
  },
];
