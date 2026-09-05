import React, { useState } from 'react';
import { 
  ShieldCheck, UserPlus, ShieldAlert, CheckCircle2, 
  XCircle, Trash2, Smartphone, KeyRound, UserCheck, Search 
} from 'lucide-react';
import AddAdminModal from './AddAdminModal';

export default function AdminsTab({
  users,
  currentUser,
  onAdminCreated,
  onToggleStatus,
  onDeleteAdmin
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile.includes(searchQuery) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const superAdminCount = users.filter(u => u.role === 'super_admin').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Admin & Staff Directory</h2>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-purple-200">
              Super Admin Control
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage administrative credentials, mobile login access, and staff roles.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-zinc-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center space-x-2 shadow-md shadow-black/10"
        >
          <UserPlus size={16} />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Administrators</p>
            <p className="text-2xl font-black text-zinc-900 mt-1">{users.length}</p>
          </div>
          <div className="w-11 h-11 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-700">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Staff</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{activeCount}</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Super Admins</p>
            <p className="text-2xl font-black text-purple-950 mt-1">{superAdminCount}</p>
          </div>
          <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-zinc-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
          Showing {filteredUsers.length} of {users.length} accounts
        </span>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-100/70 border-b border-zinc-200 font-bold text-zinc-600">
                <th className="p-4">Administrator</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">Role & Level</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 italic">
                    No administrators found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = user.id === currentUser?.id;
                  const isRoot = user.isRoot;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                            user.role === 'super_admin' ? 'bg-purple-900 text-white' : 'bg-zinc-900 text-white'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-zinc-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-bold">
                                  You
                                </span>
                              )}
                              {isRoot && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                  Primary
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Mobile Number */}
                      <td className="p-4 font-bold text-zinc-800 tracking-wider">
                        +91 {user.mobile.slice(0, 5)} {user.mobile.slice(5)}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          user.role === 'super_admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {user.role === 'super_admin' ? '👑 Super Admin' : '👤 Staff Admin'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}>
                          {user.status === 'active' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                              <span>Deactivated</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-zinc-500 font-medium text-[11px] whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active/Inactive */}
                          {!isRoot && !isCurrent && (
                            <button
                              onClick={() => onToggleStatus(user.id)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors border ${
                                user.status === 'active'
                                  ? 'bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-800 border-zinc-200 hover:border-amber-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                              title={user.status === 'active' ? 'Deactivate Login' : 'Activate Login'}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}

                          {/* Delete Account */}
                          {!isRoot && !isCurrent && (
                            <button
                              onClick={() => onDeleteAdmin(user.id, user.name)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Admin Account"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          {(isRoot || isCurrent) && (
                            <span className="text-[11px] text-zinc-400 italic px-2">
                              Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdminCreated={onAdminCreated}
      />
    </div>
  );
}
