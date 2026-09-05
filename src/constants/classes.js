export const DEFAULT_ACADEMY_CATEGORIES = [
  { id: 'karate', name: 'Karate', icon: '🥋' }
];

export const INITIAL_BATCHES = [
  {
    id: 'batch-karate-1',
    name: 'Kids Karate Academy (White & Yellow Belt)',
    category: 'karate',
    icon: '🥋',
    instructor: 'Sensei Rajesh Kumar (3rd Dan Black Belt)',
    days: ['Tue', 'Thu', 'Sat'],
    startTime: '17:00',
    endTime: '18:00',
    monthlyFee: 2000,
    capacity: 20,
    enrolledCount: 2,
    status: 'active',
    notes: 'Kihon fundamentals, katas, and fitness training.'
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'student-1',
    name: 'Aarav Patel',
    phone: '9820112233',
    batchId: 'batch-karate-1',
    batchName: 'Kids Karate Academy (White & Yellow Belt)',
    category: 'karate',
    enrolledDate: '2026-08-10',
    monthlyFee: 2000,
    feeCycle: 'monthly',
    lastPaymentDate: '2026-08-10',
    paymentMode: 'upi',
    nextRenewalDate: '2026-09-08',
    status: 'active',
    guardianName: 'Suresh Patel'
  },
  {
    id: 'student-2',
    name: 'Diya Menon',
    phone: '9845098765',
    batchId: 'batch-karate-1',
    batchName: 'Kids Karate Academy (White & Yellow Belt)',
    category: 'karate',
    enrolledDate: '2026-08-15',
    monthlyFee: 2000,
    feeCycle: 'monthly',
    lastPaymentDate: '2026-08-15',
    paymentMode: 'cash',
    nextRenewalDate: '2026-09-15',
    status: 'active',
    guardianName: 'Priya Menon'
  }
];

export const INITIAL_SHIFT_HANDOVERS = [
  {
    id: 1725520000001,
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    shiftType: 'day',
    outgoingStaff: 'Ramesh (Day Shift)',
    incomingStaff: 'Karthik (Evening Shift)',
    expectedCash: 3500,
    physicalCash: 3500,
    difference: 0,
    openingFloat: 500,
    notes: 'Morning shift smooth. All cash drawer counted and reconciled.'
  }
];
