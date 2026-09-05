import React, { useState } from 'react';
import { X, Trophy, Plus, Minus, Trash2, Calendar, Users, DollarSign } from 'lucide-react';
import { getLocalYYYYMMDD } from '../../utils/slots';

export default function TournamentModal({
  isOpen,
  onClose,
  onSaveTournament
}) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [sport, setSport] = useState('Pickleball');
  const [format, setFormat] = useState('Round Robin');
  const [date, setDate] = useState(getLocalYYYYMMDD());
  const [entryFee, setEntryFee] = useState('500');
  const [teamsText, setTeamsText] = useState('Team Alpha\nTeam Beta\nTeam Gamma\nTeam Delta');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a tournament name.");
      return;
    }

    const teamNames = teamsText
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (teamNames.length < 2) {
      alert("Please enter at least 2 teams.");
      return;
    }

    const teams = teamNames.map((tName, idx) => ({
      id: `t-${Date.now()}-${idx}`,
      name: tName,
      played: 0,
      won: 0,
      lost: 0,
      pointsDiff: 0,
      points: 0
    }));

    // Generate round-robin match pairings
    const matches = [];
    let matchCounter = 1;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: `m-${Date.now()}-${matchCounter}`,
          round: `Fixture ${matchCounter}`,
          team1: teams[i].name,
          team2: teams[j].name,
          score1: '',
          score2: '',
          winner: null,
          status: 'pending'
        });
        matchCounter++;
      }
    }

    const feePerTeam = parseFloat(entryFee) || 0;
    const totalCollectedFees = feePerTeam * teams.length;

    const newTournament = {
      id: 'tour-' + Date.now(),
      name: name.trim(),
      sport,
      format,
      date,
      entryFee: feePerTeam,
      status: 'active',
      teams,
      matches,
      createdAt: new Date().toISOString()
    };

    const feeTransaction = totalCollectedFees > 0 ? {
      id: Date.now(),
      type: 'income',
      amount: totalCollectedFees,
      category: 'Tournament Entry Fee',
      paymentMode: 'upi',
      description: `Entry Fees (${teams.length} Teams): ${name.trim()}`,
      date: new Date().toISOString()
    } : null;

    onSaveTournament(newTournament, feeTransaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-gradient-to-r from-zinc-900 to-amber-950 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            <div>
              <h3 className="font-extrabold text-sm text-white">Create New Tournament / League</h3>
              <p className="text-[10px] text-zinc-400">Generate fixtures & live leaderboards</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Tournament Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Tournament Name / Title
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Panda Weekend Pickleball Open"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
            />
          </div>

          {/* Sport & Format */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Sport
              </label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              >
                <option value="Pickleball">Pickleball</option>
                <option value="Badminton">Badminton</option>
                <option value="Karate">Karate (Kumite/Kata)</option>
                <option value="Table Tennis">Table Tennis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Tournament Format
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              >
                <option value="Round Robin">Round Robin (Box League)</option>
                <option value="Knockout">Knockout Elimination</option>
              </select>
            </div>
          </div>

          {/* Date & Entry Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Event Date
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Entry Fee per Team (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={entryFee}
                onChange={e => setEntryFee(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Teams / Players List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1 flex justify-between items-center">
              <span>Participating Teams / Players</span>
              <span className="text-[10px] text-zinc-400 font-semibold">(One team per line)</span>
            </label>
            <textarea
              required
              rows={4}
              value={teamsText}
              onChange={e => setTeamsText(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs font-medium text-zinc-900 outline-none focus:border-black"
              placeholder="Team 1&#10;Team 2&#10;Team 3&#10;Team 4"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-xs hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-xs shadow-md"
            >
              Generate Tournament & Fixtures
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
