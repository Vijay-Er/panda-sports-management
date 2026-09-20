export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const PREFERRED_TIME_OPTIONS = ['Morning', 'Evening', 'Both', 'Flexible'];
export const PREFERRED_SERVICE_OPTIONS = ['Court Booking', 'Group Game', 'Both', 'Academy Only'];
export const PREFERRED_SPORTS_OPTIONS = ['Badminton', 'Pickleball'];
export const SKILL_LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
export const PLAY_FREQUENCY_OPTIONS = ['Daily', '2-3 times/week', 'Weekly', 'Occasionally'];
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const INTEREST_OPTIONS = ['Fitness', 'Competitive Play', 'Social', 'Training', 'Tournaments', 'Kids Activity'];
export const REFERRAL_SOURCE_OPTIONS = ['Friend', 'Google', 'Social Media', 'Walk-in', 'Existing Member', 'Other'];
export const MEMBERSHIP_TYPE_OPTIONS = ['Walk-in', 'Regular', 'Monthly Member', 'Annual Member', 'VIP'];

export const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: 'Rahul Team',
    phone: '9876543210',
    walletBalance: 1500,
    passHours: 10,
    notes: 'Regular group of 4 players',
    createdAt: '2026-01-15T00:00:00.000Z',
    area: 'Anna Nagar',
    preferredTime: 'Evening',
    preferredService: 'Both',
    preferredSports: ['Badminton', 'Pickleball'],
    skillLevel: 'Advanced',
    occupation: 'Software Engineer',
    company: 'TCS',
    interests: ['Competitive Play', 'Fitness'],
    membershipType: 'Regular',
    playFrequency: '2-3 times/week',
    preferredDays: ['Tue', 'Thu', 'Sat'],
    gender: 'Male',
    email: 'rahul.team@gmail.com',
    dateOfBirth: '1990-03-15',
    referredBy: 'Walk-in',
    isActive: true,
    lastVisitDate: '2026-09-19T08:03:07.000Z'
  },
  {
    id: 2,
    name: 'Sanjay & Friends',
    phone: '9988776655',
    walletBalance: 500,
    passHours: 0,
    notes: 'Weekend morning slot usually',
    createdAt: '2026-02-10T00:00:00.000Z',
    area: 'T. Nagar',
    preferredTime: 'Morning',
    preferredService: 'Group Game',
    preferredSports: ['Badminton'],
    skillLevel: 'Intermediate',
    occupation: 'Business Owner',
    interests: ['Social', 'Fitness'],
    membershipType: 'Regular',
    playFrequency: 'Weekly',
    preferredDays: ['Sat', 'Sun'],
    gender: 'Male',
    referredBy: 'Friend',
    isActive: true,
    lastVisitDate: '2026-09-16T08:03:07.000Z'
  },
  {
    id: 3,
    name: 'Aarav Patel',
    phone: '9876500112',
    walletBalance: 0,
    passHours: 0,
    notes: 'Academy student',
    createdAt: '2026-05-01T00:00:00.000Z',
    area: 'Adyar',
    preferredTime: 'Evening',
    preferredService: 'Academy Only',
    preferredSports: ['Badminton'],
    skillLevel: 'Beginner',
    gender: 'Male',
    dateOfBirth: '2015-06-20',
    emergencyContactName: 'Suresh Patel',
    emergencyContactPhone: '9876543210',
    interests: ['Kids Activity', 'Training'],
    membershipType: 'Monthly Member',
    referredBy: 'Google',
    isActive: true,
    lastVisitDate: '2026-09-14T08:03:07.000Z'
  },
  {
    id: 4,
    name: 'Diya Menon',
    phone: '9870011223',
    walletBalance: 0,
    passHours: 0,
    notes: 'Academy student',
    createdAt: '2026-06-15T00:00:00.000Z',
    area: 'Velachery',
    preferredTime: 'Evening',
    preferredService: 'Academy Only',
    preferredSports: ['Badminton'],
    skillLevel: 'Beginner',
    gender: 'Female',
    dateOfBirth: '2014-11-08',
    emergencyContactName: 'Priya Menon',
    emergencyContactPhone: '9870011224',
    interests: ['Kids Activity'],
    membershipType: 'Monthly Member',
    referredBy: 'Existing Member',
    isActive: true,
    lastVisitDate: '2026-09-12T08:03:07.000Z'
  }
];
