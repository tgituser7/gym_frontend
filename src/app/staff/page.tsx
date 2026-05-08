'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Staff } from '@/types';
import StaffModal from '@/components/modals/StaffModal';
import ConfirmDialog from '@/components/ConfirmDialog';

const ROLES = ['Trainer', 'Instructor', 'Manager', 'Receptionist', 'Maintenance', 'Nutritionist', 'Other'];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.staff.list({ search, role: roleFilter });
      setStaff(data);
    } catch {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchStaff, 300);
    return () => clearTimeout(t);
  }, [fetchStaff]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.staff.delete(deleteTarget._id);
      setStaff((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete staff member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = (item: Staff) => {
    setStaff((prev) => {
      const idx = prev.findIndex((s) => s._id === item._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
      return [item, ...prev];
    });
    setModalOpen(false);
  };

  const openEdit = (s: Staff) => { setSelected(s); setModalOpen(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Staff</h2>
          <p className="text-gray-500 text-sm mt-0.5">{staff.length} staff members</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => { setSelected(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Staff</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name, email or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No staff found.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {staff.map((s) => (
                <div key={s._id} className="flex items-start justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.email}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{s.role}</span>
                      <span className={s.status === 'active' ? 'badge-active' : 'badge-inactive'}>{s.status}</span>
                      {s.salary ? <span className="text-xs text-gray-400">₹{s.salary.toLocaleString()}</span> : null}
                    </div>
                    {s.specialization && <p className="text-xs text-gray-400 mt-0.5">{s.specialization}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0 mt-0.5">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Specialization</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Salary</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staff.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.email}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{s.role}</span></td>
                      <td className="px-4 py-3 text-gray-600">{s.specialization || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{s.salary ? `₹${s.salary.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3"><span className={s.status === 'active' ? 'badge-active' : 'badge-inactive'}>{s.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(s)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {modalOpen && <StaffModal staff={selected} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Staff Member"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
