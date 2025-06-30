
import { AdminReservation, AvailabilitySlot, ReservationStatistics } from '@/types/adminReservations';

export const getReservationsByDate = (reservations: AdminReservation[], date: string): AdminReservation[] => {
  const result = reservations?.filter(r => r.reservation_date === date) || [];
  console.log(`Reservations for ${date}:`, result.length);
  return result;
};

export const getAvailabilityForDate = (reservations: AdminReservation[], date: string): AvailabilitySlot[] => {
  console.log('Getting availability for date:', date);
  const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'];
  const dateReservations = getReservationsByDate(reservations, date);
  
  return timeSlots.map(time => {
    const slotReservations = dateReservations.filter(r => 
      r.reservation_time === time && r.status !== 'cancelled'
    );
    const reserved = slotReservations.reduce((sum, r) => sum + r.number_of_people, 0);
    
    return {
      date,
      time,
      available: reserved < 4,
      capacity: 4,
      reserved
    };
  });
};

export const calculateStatistics = (reservations: AdminReservation[]): ReservationStatistics | null => {
  console.log('Calculating statistics...');
  if (!reservations) {
    console.log('No reservations data for statistics');
    return null;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const stats = {
    totalReservations: reservations.length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
    todayReservations: reservations.filter(r => r.reservation_date === today).length,
    monthlyReservations: reservations.filter(r => r.reservation_date.startsWith(thisMonth)).length,
    totalRevenue: reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.total_price, 0)
  };
  
  console.log('Statistics calculated:', stats);
  return stats;
};
