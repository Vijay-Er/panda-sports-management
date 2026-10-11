// Shift Types and Staff Members Constants for Panda Sports Academy
import { getLocalYYYYMMDD } from '../utils/slots';

export const SHIFT_TYPES = [
  {
    id: 'morning',
    name: 'Morning Shift',
    hours: '06:00 AM – 02:00 PM',
    icon: '🌅',
    color: 'amber'
  },
  {
    id: 'evening',
    name: 'Evening Shift',
    hours: '02:00 PM – 10:00 PM',
    icon: '🌆',
    color: 'purple'
  },
  {
    id: 'full_day',
    name: 'Full Day Shift',
    hours: '06:00 AM – 10:00 PM',
    icon: '☀️',
    color: 'blue'
  }
];

export const DEFAULT_STAFF_MEMBERS = [
  'Vignesh',
  'Vijay',
  'Rahul',
  'Priyan',
  'Frontdesk Staff'
];

/**
 * Determine current shift dynamically based on current time
 */
export function getCurrentShiftType() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) {
    return 'Morning Shift';
  } else {
    return 'Evening Shift';
  }
}

export const INITIAL_ACTIVE_SHIFT = {
  staffName: 'Vignesh',
  shiftType: getCurrentShiftType(),
  shiftDate: getLocalYYYYMMDD(),
  startTime: '06:00',
  notes: 'Active duty at Panda Sports counter'
};
