import React, { useState, useMemo } from 'react';
import { 
  Trophy, Plus, Calendar, Medal, Users, CheckCircle2, 
  MessageSquare, Share2, Award, Clock, ArrowRight, Trash2 
} from 'lucide-react';
import TournamentModal from './TournamentModal';

export default function TournamentsTab({
  tournaments = [],
  onSaveTournament,
  onUpdateMatchScore,
  onDeleteTournament
}) {
  const [selectedTournamentId, setSelectedTournamentId] = useState(tournaments[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState('standings'); // 'standings', 'fixtures'
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Active tournament object
  const activeTournament = tournaments.find(t => t.id === selectedTournamentId) || tournaments[0];

  // Sorted leaderboard by points desc, then pointsDiff desc
  const sortedStandings = useMemo(() => {
    if (!activeTournament || !activeTournament.teams) return [];
    return [...activeTournament.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.pointsDiff - a.pointsDiff;
    });
  }, [activeTournament]);

  // Score editing local state
  const [editingScores, setEditingScores] = useState({});

  const handleScoreChange = (matchId, team, val) => {
    setEditingScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: val
      }
    }));
  };

  const handleSaveScore = (match) => {
    const scores = editingScores[match.id] || {};
    const s1 = parseInt(scores.score1 ?? match.score1, 10);
    const s2 = parseInt(scores.score2 ?? match.score2, 10);

    if (isNaN(s1) || isNaN(s2)) {
      alert("Please enter valid numeric scores for both teams.");
      return;
    }

    const winner = s1 > s2 ? match.team1 : s2 > s1 ? match.team2 : 'Draw';

    onUpdateMatchScore(activeTournament.id, match.id, {
      score1: s1.toString(),
      score2: s2.toString(),
      winner,
      status: 'completed'
    });
  };

  // WhatsApp Leaderboard Share
  const handleShareWhatsApp = () => {
    if (!activeTournament) return;

    const standingsLines = sortedStandings.map((t, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      return `${medal} *${t.name}* — ${t.points} Pts (${t.won}W / ${t.lost}L, Diff: ${t.pointsDiff > 0 ? '+' : ''}${t.pointsDiff})`;
    });

    const msg = [
      `🐼 *PANDA SPORTS ACADEMY — TOURNAMENT STANDINGS*`,
      `🏆 *${activeTournament.name}*`,
      `🏸 *Sport:* ${activeTournament.sport} • *Format:* ${activeTournament.format}`,
      `📅 *Date:* ${activeTournament.date}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*LIVE LEADERBOARD:*`,
      ...standingsLines,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🎾 *Panda Sports Academy Tournament Center*`
    ].join('\n');

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  if (!activeTournament && tournaments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Tournaments & Box Leagues</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Manage pickleball, badminton & martial arts weekend cups</p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#d33638] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-md shadow-red-900/20"
          >
            <Plus size={16} /> Create Tournament
          </button>
        </div>

        <div className="bg-white p-12 rounded-2xl border border-zinc-200 text-center space-y-3">
          <Trophy size={48} className="mx-auto text-amber-500 opacity-80" />
          <h3 className="text-base font-bold text-zinc-800">No active tournaments</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Create weekend leagues, community cups, and tournaments with automatic pairings and live standings.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-colors inline-flex items-center gap-1.5"
          >
            <Plus size={16} /> Get Started Now
          </button>
        </div>

        <TournamentModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSaveTournament={onSaveTournament}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-500" size={26} />
            Tournaments & Box Leagues
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Real-time match fixtures, score recording, and live standings
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Share current standings on WhatsApp"
          >
            <MessageSquare size={15} />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#d33638] hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-900/20 active:scale-95"
          >
            <Plus size={16} />
            <span>New Tournament</span>
          </button>
        </div>
      </div>

      {/* Tournament Selector Strip & Quick Stats */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Event:</span>
          <select
            value={selectedTournamentId}
            onChange={e => setSelectedTournamentId(e.target.value)}
            className="bg-zinc-100 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-zinc-900 outline-none focus:border-black"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.sport} • {t.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
            🏆 {activeTournament.sport} ({activeTournament.format})
          </span>
          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
            👥 {activeTournament.teams.length} Teams
          </span>
          <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg">
            📅 {activeTournament.date}
          </span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete tournament "${activeTournament.name}"?`)) {
                onDeleteTournament(activeTournament.id);
              }
            }}
            className="text-zinc-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
            title="Delete tournament"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Sub-view Nav Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('standings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'standings'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <Medal size={15} className="text-amber-400" />
          <span>Leaderboard & Standings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('fixtures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'fixtures'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <Calendar size={15} />
          <span>Match Fixtures & Live Scores ({activeTournament.matches.length})</span>
        </button>
      </div>

      {/* VIEW 1: STANDINGS */}
      {activeSubTab === 'standings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/70 border-b border-zinc-200 text-xs font-bold text-zinc-600">
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Team / Player Name</th>
                  <th className="p-3.5 text-center">Played</th>
                  <th className="p-3.5 text-center">Won</th>
                  <th className="p-3.5 text-center">Lost</th>
                  <th className="p-3.5 text-center">Point Diff</th>
                  <th className="p-3.5 text-center">Total Points</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {sortedStandings.map((team, idx) => (
                  <tr
                    key={team.id || idx}
                    className={`transition-colors ${
                      idx === 0
                        ? 'bg-amber-50/40 font-bold'
                        : 'hover:bg-zinc-50/70'
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && <span className="text-base">🥇</span>}
                        {idx === 1 && <span className="text-base">🥈</span>}
                        {idx === 2 && <span className="text-base">🥉</span>}
                        <span className="font-extrabold text-zinc-900">#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-extrabold text-zinc-900 text-sm">
                      {team.name}
                    </td>
                    <td className="p-3.5 text-center font-bold text-zinc-700">{team.played}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">{team.won}</td>
                    <td className="p-3.5 text-center font-bold text-red-500">{team.lost}</td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      {team.pointsDiff > 0 ? `+${team.pointsDiff}` : team.pointsDiff}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="text-sm font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-lg">
                        {team.points} pts
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {idx === 0 ? (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                          Leader
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400">Contender</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FIXTURES & SCORE ENTRY */}
      {activeSubTab === 'fixtures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeTournament.matches.map(match => {
            const scores = editingScores[match.id] || {};
            const isCompleted = match.status === 'completed';

            return (
              <div
                key={match.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-white border-zinc-200'
                    : 'bg-amber-50/30 border-amber-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                    {match.round}
                  </span>
                  {isCompleted ? (
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Finished
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={12} /> Live / Scheduled
                    </span>
                  )}
                </div>

                {/* Teams & Scores */}
                <div className="space-y-2.5">
                  {/* Team 1 */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${match.winner === match.team1 ? 'text-emerald-700 font-extrabold' : 'text-zinc-800'}`}>
                      {match.team1} {match.winner === match.team1 && '🏆'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={scores.score1 !== undefined ? scores.score1 : (match.score1 ?? '')}
                      onChange={e => handleScoreChange(match.id, 'score1', e.target.value)}
                      placeholder="0"
                      className="w-14 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-center font-black text-sm outline-none focus:border-[#d33638]"
                    />
                  </div>

                  {/* Team 2 */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${match.winner === match.team2 ? 'text-emerald-700 font-extrabold' : 'text-zinc-800'}`}>
                      {match.team2} {match.winner === match.team2 && '🏆'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={scores.score2 !== undefined ? scores.score2 : (match.score2 ?? '')}
                      onChange={e => handleScoreChange(match.id, 'score2', e.target.value)}
                      placeholder="0"
                      className="w-14 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-center font-black text-sm outline-none focus:border-[#d33638]"
                    />
                  </div>
                </div>

                {/* Save / Update Result */}
                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveScore(match)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-[11px] font-extrabold rounded-lg transition-colors shadow-sm"
                  >
                    {isCompleted ? 'Update Score' : 'Save Match Result'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tournament Modal */}
      <TournamentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSaveTournament={onSaveTournament}
      />
    </div>
  );
}
