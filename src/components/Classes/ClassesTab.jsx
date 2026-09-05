import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Users, Calendar, Clock, DollarSign, Award, 
  Search, AlertCircle, CheckCircle2, MessageSquare, Phone, 
  Trash2, Edit, Banknote, RefreshCw 
} from 'lucide-react';
import { getLocalYYYYMMDD } from '../../utils/slots';
import BatchModal from './BatchModal';
import EnrollStudentModal from './EnrollStudentModal';
import CoachPayoutModal from './CoachPayoutModal';

export default function ClassesTab({
  batches = [],
  students = [],
  categories = [{ id: 'karate', name: 'Karate', icon: '🥋' }],
  onAddCategory,
  onSaveBatch,
  onDeleteBatch,
  onEnrollStudent,
  onDeleteStudent,
  onCollectStudentRenewal,
  onAddCoachPayout,
  customers = [],
  prefilledCustomer = null,
  onClearPrefilledCustomer
}) {
  const todayStr = getLocalYYYYMMDD();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollBatchId, setEnrollBatchId] = useState(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Auto-open Enroll modal if prefilledCustomer is provided
  useEffect(() => {
    if (prefilledCustomer) {
      setIsEnrollModalOpen(true);
    }
  }, [prefilledCustomer]);

  // Filter batches
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (selectedCategory === 'all') return true;
      return b.category === selectedCategory;
    });
  }, [batches, selectedCategory]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        (s.batchName && s.batchName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [students, searchQuery, selectedCategory]);

  // Identify students due for renewal within 3 days or overdue
  const dueStudents = useMemo(() => {
    const todayTime = new Date(todayStr).getTime();
    const threeDaysLater = todayTime + (3 * 24 * 60 * 60 * 1000);

    return students.filter(s => {
      if (!s.nextRenewalDate) return false;
      const renewalTime = new Date(s.nextRenewalDate).getTime();
      return renewalTime <= threeDaysLater;
    });
  }, [students, todayStr]);

  // Open WhatsApp Fee Reminder
  const handleSendWhatsAppReminder = (s) => {
    const isOverdue = s.nextRenewalDate < todayStr;
    const msg = [
      `🐼 *PANDA SPORTS ACADEMY — FEE RENEWAL NOTICE*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🥋 *Program:* ${s.batchName}`,
      `👤 *Student:* ${s.name} (${s.level || 'Member'})`,
      `💰 *Monthly Fee:* ₹${Number(s.feeAmount).toLocaleString()}`,
      `📅 *Due Date:* ${s.nextRenewalDate}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      isOverdue 
        ? `⚠️ *Status:* The monthly fee is currently overdue. Kindly settle via Cash at front desk or UPI.` 
        : `ℹ️ *Status:* Your monthly fee renewal is due in a few days.`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *Panda Sports Academy, Coimbatore*`,
      `Thank you for training with us! 🎾🥋🧘`
    ].join('\n');

    window.open(`https://api.whatsapp.com/send?phone=91${s.phone}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Classes & Academy Programs</h2>
            <span className="bg-red-50 text-[#d33638] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-200">
              Karate & Academy Batches
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage training batches, student enrollments, attendance, and monthly fee collections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 border border-zinc-200"
          >
            <Award size={15} className="text-[#d33638]" />
            <span>Coach Payout</span>
          </button>

          <button
            onClick={() => {
              setEnrollBatchId(null);
              setIsEnrollModalOpen(true);
            }}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Users size={15} />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={() => {
              setEditingBatch(null);
              setIsBatchModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#d33638] hover:bg-[#b42628] text-white rounded-xl font-extrabold text-sm transition-all flex items-center gap-1.5 shadow-md shadow-red-900/20 active:scale-95"
          >
            <Plus size={16} />
            <span>Create Batch</span>
          </button>
        </div>
      </div>

      {/* Renewal Alert Banner (If students due soon) */}
      {dueStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-extrabold text-xs">
                {dueStudents.length} Student{dueStudents.length > 1 ? 's' : ''} Due for Monthly Fee Renewal
              </p>
              <p className="text-[11px] text-amber-700">
                Fees expiring within 3 days or overdue. Use the 1-click WhatsApp reminder below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dueStudents.slice(0, 2).map(s => (
              <span key={s.id} className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg text-zinc-700 border border-amber-200">
                {s.name} ({s.nextRenewalDate})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills (Dynamic from Admin-defined categories) */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-zinc-100 rounded-2xl w-fit">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/80'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>🏆</span>
          <span>All Programs ({batches.length})</span>
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>{cat.icon || '🥋'}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Batches Cards Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
            <span>Scheduled Academy Batches ({filteredBatches.length})</span>
          </h3>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
            <p className="text-xs text-zinc-400 italic">No batches created for this category. Click "Create Batch" to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map(batch => {
              const enrolledCount = students.filter(s => s.batchId === batch.id).length;
              const fillPercentage = Math.min(100, Math.round((enrolledCount / (batch.capacity || 20)) * 100));

              return (
                <div 
                  key={batch.id} 
                  className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-zinc-900 transition-all shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl filter drop-shadow-sm">{batch.icon || '🥋'}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-900 leading-snug">{batch.name}</h4>
                          <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                            <span>Coach:</span>
                            <span className="text-zinc-800">{batch.instructor}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEditingBatch(batch);
                          setIsBatchModalOpen(true);
                        }}
                        className="text-zinc-400 hover:text-zinc-700 p-1"
                        title="Edit Batch"
                      >
                        <Edit size={15} />
                      </button>
                    </div>

                    {/* Schedule Chips */}
                    <div className="mt-3 space-y-1.5 text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-zinc-400 shrink-0" />
                        <span className="font-semibold">{batch.days.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-zinc-400 shrink-0" />
                        <span>{batch.startTime} – {batch.endTime}</span>
                      </div>
                    </div>

                    {/* Capacity & Revenue Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500 font-bold">Enrolled: {enrolledCount} / {batch.capacity}</span>
                        <span className="font-extrabold text-emerald-700">₹{batch.monthlyFee}/month</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setEnrollBatchId(batch.id);
                        setIsEnrollModalOpen(true);
                      }}
                      className="flex-1 bg-zinc-900 hover:bg-black text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={13} />
                      <span>Enroll Student</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete batch "${batch.name}"?`)) {
                          onDeleteBatch(batch.id);
                        }
                      }}
                      className="p-2 text-zinc-300 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Delete Batch"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Enrolled Roster Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <Users size={18} className="text-[#d33638]" />
              <span>Enrolled Students & Fee Renewal Roster ({filteredStudents.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">Track student belt levels, next fee renewals, and WhatsApp notices</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold outline-none focus:border-black"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 italic">
            No students currently enrolled in selected programs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/70 border-b border-zinc-200 text-xs font-bold text-zinc-600">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Program / Batch</th>
                  <th className="p-3">Parent Phone</th>
                  <th className="p-3">Belt / Level</th>
                  <th className="p-3 text-right">Fee Rate</th>
                  <th className="p-3 text-center">Renewal Due</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredStudents.map(student => {
                  const isOverdue = student.nextRenewalDate && student.nextRenewalDate < todayStr;
                  const isDueSoon = !isOverdue && student.nextRenewalDate && (
                    new Date(student.nextRenewalDate).getTime() - new Date(todayStr).getTime() <= 3 * 24 * 60 * 60 * 1000
                  );

                  return (
                    <tr key={student.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-zinc-900 whitespace-nowrap">
                        {student.name}
                        {student.uniformIssued && (
                          <span className="ml-1.5 text-[9px] font-bold bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-200">
                            Gi Issued
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-zinc-700 whitespace-nowrap">
                        {student.batchName}
                      </td>
                      <td className="p-3 font-bold text-zinc-600 whitespace-nowrap">
                        📱 +91 {student.phone}
                      </td>
                      <td className="p-3 text-zinc-500 whitespace-nowrap">
                        {student.level || '—'}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700 whitespace-nowrap">
                        ₹{Number(student.feeAmount).toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-bold whitespace-nowrap">
                        {student.nextRenewalDate || '—'}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800 border-red-200 animate-pulse' 
                            : isDueSoon 
                            ? 'bg-amber-100 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Paid Active'}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Collect Renewal */}
                          <button
                            onClick={() => {
                              const method = window.confirm(`Collect ₹${student.feeAmount} renewal via UPI? (Click OK for UPI, Cancel for Cash)`) ? 'upi' : 'cash';
                              onCollectStudentRenewal(student.id, student.feeAmount, method);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            title="Collect next month's fee"
                          >
                            <RefreshCw size={11} />
                            <span>Collect</span>
                          </button>

                          {/* WhatsApp Reminder */}
                          <button
                            onClick={() => handleSendWhatsAppReminder(student)}
                            className="p-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                            title="Send WhatsApp Fee Notice"
                          >
                            <MessageSquare size={13} />
                          </button>

                          {/* Remove Student */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove ${student.name} from enrolled roster?`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-1 text-zinc-300 hover:text-red-600 rounded-lg"
                            title="Remove student"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setEditingBatch(null);
        }}
        initialBatch={editingBatch}
        categories={categories}
        onAddCategory={onAddCategory}
        onSaveBatch={onSaveBatch}
      />

      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          if (onClearPrefilledCustomer) onClearPrefilledCustomer();
        }}
        batches={batches}
        initialBatchId={enrollBatchId}
        onEnrollStudent={onEnrollStudent}
        customers={customers}
        prefilledCustomer={prefilledCustomer}
      />

      <CoachPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        batches={batches}
        onAddPayout={onAddCoachPayout}
      />
    </div>
  );
}
