export const INITIAL_TOURNAMENTS = [
  {
    id: 'tour-1725531000001',
    name: 'Panda Weekend Pickleball Open (Doubles)',
    sport: 'Pickleball',
    format: 'Round Robin',
    date: new Date().toISOString().slice(0, 10),
    entryFee: 600,
    status: 'active', // 'active', 'completed'
    teams: [
      { id: 't1', name: 'Smash Masters (Rahul & Manoj)', played: 2, won: 2, lost: 0, pointsDiff: 14, points: 6 },
      { id: 't2', name: 'Ace Attackers (Sanjay & Amit)', played: 2, won: 1, lost: 1, pointsDiff: 2, points: 3 },
      { id: 't3', name: 'Spin Wizards (Karthik & Rohit)', played: 2, won: 1, lost: 1, pointsDiff: -3, points: 3 },
      { id: 't4', name: 'Net Rulers (Deepak & Arun)', played: 2, won: 0, lost: 2, pointsDiff: -13, points: 0 }
    ],
    matches: [
      {
        id: 'm1',
        round: 'Round 1',
        team1: 'Smash Masters (Rahul & Manoj)',
        team2: 'Ace Attackers (Sanjay & Amit)',
        score1: '11',
        score2: '7',
        winner: 'Smash Masters (Rahul & Manoj)',
        status: 'completed'
      },
      {
        id: 'm2',
        round: 'Round 1',
        team1: 'Spin Wizards (Karthik & Rohit)',
        team2: 'Net Rulers (Deepak & Arun)',
        score1: '11',
        score2: '8',
        winner: 'Spin Wizards (Karthik & Rohit)',
        status: 'completed'
      },
      {
        id: 'm3',
        round: 'Round 2',
        team1: 'Smash Masters (Rahul & Manoj)',
        team2: 'Spin Wizards (Karthik & Rohit)',
        score1: '11',
        score2: '6',
        winner: 'Smash Masters (Rahul & Manoj)',
        status: 'completed'
      },
      {
        id: 'm4',
        round: 'Round 2',
        team1: 'Ace Attackers (Sanjay & Amit)',
        team2: 'Net Rulers (Deepak & Arun)',
        score1: '11',
        score2: '5',
        winner: 'Ace Attackers (Sanjay & Amit)',
        status: 'completed'
      },
      {
        id: 'm5',
        round: 'Round 3 (Upcoming)',
        team1: 'Smash Masters (Rahul & Manoj)',
        team2: 'Net Rulers (Deepak & Arun)',
        score1: '',
        score2: '',
        winner: null,
        status: 'pending'
      },
      {
        id: 'm6',
        round: 'Round 3 (Upcoming)',
        team1: 'Ace Attackers (Sanjay & Amit)',
        team2: 'Spin Wizards (Karthik & Rohit)',
        score1: '',
        score2: '',
        winner: null,
        status: 'pending'
      }
    ]
  }
];
