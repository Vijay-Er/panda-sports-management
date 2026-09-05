export const COURTS = [
  { id: 'court-1', name: 'Court 1 (Premium)' },
  { id: 'court-2', name: 'Court 2 (Standard)' },
  { id: 'court-3', name: 'Court 3 (Standard)' },
  { id: 'court-4', name: 'Court 4 (Training)' },
];

export const RENTAL_ADDONS = [
  {
    id: 'paddle',
    name: 'Pro Paddle Rental',
    price: 50,
    icon: '🏓',
    unit: 'paddle'
  },
  {
    id: 'shoes',
    name: 'Non-Marking Shoes Rental',
    price: 50,
    icon: '👟',
    unit: 'pair',
    hasSizeInput: true
  },
  {
    id: 'balls',
    name: 'Tournament Ball Can (Buy)',
    price: 250,
    icon: '🎾',
    unit: 'can'
  }
];

export const DEFAULT_BEVERAGES = [
  { id: 1, name: 'Lemon Drink', price: 30, icon: '🍋', category: 'Beverage', stock: 24 },
  { id: 2, name: 'Energy Drink', price: 60, icon: '⚡', category: 'Beverage', stock: 18 },
  { id: 3, name: 'Cold Coffee', price: 50, icon: '☕', category: 'Beverage', stock: 12 },
  { id: 4, name: 'Mineral Water', price: 20, icon: '💧', category: 'Beverage', stock: 36 },
  { id: 5, name: 'Protein Bar', price: 50, icon: '🍫', category: 'Snack', stock: 15 },
  { id: 6, name: 'Salted Peanuts', price: 30, icon: '🥜', category: 'Snack', stock: 20 }
];

export const EMOJI_PICKER_OPTIONS = [
  '🥤', '🧃', '🧋', '☕', '🍵', '🧉', '🥛', '🍺', '🍻', '🍷', 
  '🍹', '🧊', '🍋', '🍎', '🍉', '🍓', '🍫', '🍿', '🥪', '🍔', 
  '🍟', '🍕', '🥨', '🍪', '🥜', '⚡', '💧', '🎾', '🏸'
];
