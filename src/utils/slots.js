import { COURTS } from '../constants/resources';

export const getLocalYYYYMMDD = (d = new Date()) => {
  if (typeof d === 'string') d = new Date(d);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const timeToMins = (t) => {
  if (!t || typeof t !== 'string') return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const generateTimeSlots = (startHour = 6, endHour = 24) => {
  const slots = [];
  for (let i = startHour; i < endHour; i++) {
    const hour = i.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

export const calculateEndFromSlots = (slots) => {
  if (!slots || slots.length === 0) return '';
  const lastSlot = slots[slots.length - 1];
  const m = timeToMins(lastSlot) + 30;
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const mins = (m % 60).toString().padStart(2, '0');
  return `${h}:${mins}`;
};

export const getOverlappingBookingsCount = (slot, date, serviceType, bookings) => {
  const slotMins = timeToMins(slot);
  return bookings.filter(b => {
    if (b.date !== date || b.status === 'canceled') return false;
    return slotMins >= timeToMins(b.startTime) && slotMins < timeToMins(b.endTime);
  }).length;
};

export const isSlotFullyBooked = (slot, date, serviceType, bookings) => {
  const count = getOverlappingBookingsCount(slot, date, serviceType, bookings);
  return count >= COURTS.length;
};

export const assignResource = (startMins, endMins, date, serviceType, bookings) => {
  for (let res of COURTS) {
    const isFree = !bookings.some(b => {
      if (b.date !== date || b.status === 'canceled' || b.resourceId !== res.id) return false;
      return (startMins < timeToMins(b.endTime)) && (endMins > timeToMins(b.startTime));
    });
    if (isFree) return res;
  }
  return null;
};
