'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Member } from '@/types';
import { formatDate } from '@/lib/dates';
import MemberModal from '@/components/modals/MemberModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useSubscription } from '@/hooks/useSubscription';

const PAGE_SIZE_OPTIONS = [10, 50, 100, 500];

export default function MembersPage() {
  const { isAtLimit, isNearLimit, usageLabel } = useSubscription();
  const atLimit = isAtLimit('members');
  const nearLimit = isNearLimit('members');

  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.members.listPaged({ search, status: statusFilter, page, limit });
      setMembers(res.members);
      setTotal(res.total);
      setPages(res.pages);
    } catch {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 300);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (s: string) => { setStatusFilter(s); setPage(1); };
  const handleLimitChange = (l: number) => { setLimit(l); setPage(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.members.delete(deleteTarget._id);
      setDeleteTarget(null);
      const newPage = members.length === 1 && page > 1 ? page - 1 : page;
      if (newPage !== page) setPage(newPage); else fetchMembers();
    } catch {
      setError('Failed to delete member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = () => { setModalOpen(false); fetchMembers(); };
  const openEdit = (m: Member) => { setSelected(m); setModalOpen(true); };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} total members{usageLabel('members') ? ` · ${usageLabel('members')} active` : ''}
          </p>
        </div>
        <button
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => { if (!atLimit) { setSelected(null); setModalOpen(true); } }}
          disabled={atLimit}
          title={atLimit ? 'Member limit reached. Visit Subscription to increase.' : undefined}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Member</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {atLimit && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Active member limit reached ({usageLabel('members')}). <a href="/subscription" className="underline font-medium">Visit Subscription</a> to increase your limit.</span>
        </div>
      )}
      {!atLimit && nearLimit && (
        <div className="flex items-start gap-2 text-orange-700 bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Approaching active member limit ({usageLabel('members')}). <a href="/subscription" className="underline font-medium">Visit Subscription</a> to increase your limit.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search by name, email or phone..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
          </div>
          <select className="input sm:w-40" value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
          <span className="hidden sm:inline">Show</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handleLimitChange(n)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  limit === n ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline">per page</span>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No members found.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {members.map((m) => {
                const services = m.services as { _id: string; name: string }[];
                return (
                  <div key={m._id} className="flex items-start justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                      {m.phone && <p className="text-xs text-gray-400 mt-0.5">{m.phone}</p>}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={m.status === 'active' ? 'badge-active' : 'badge-inactive'}>{m.status}</span>
                        {services.slice(0, 2).map((s) => (
                          <span key={s._id} className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{s.name}</span>
                        ))}
                        {services.length > 2 && <span className="text-xs text-gray-400">+{services.length - 2}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 mt-0.5">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Services</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Membership End</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((m) => {
                    const services = m.services as { _id: string; name: string }[];
                    return (
                      <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                        <td className="px-4 py-3 text-gray-600">{m.email}</td>
                        <td className="px-4 py-3 text-gray-600">{m.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {services.length === 0 ? <span className="text-gray-400">None</span> : (
                              <>
                                {services.slice(0, 2).map((s) => (
                                  <span key={s._id} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{s.name}</span>
                                ))}
                                {services.length > 2 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">+{services.length - 2}</span>}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.membershipEndDate ? formatDate(m.membershipEndDate) : '-'}</td>
                        <td className="px-4 py-3"><span className={m.status === 'active' ? 'badge-active' : 'badge-inactive'}>{m.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(m)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{from}–{to} of {total}</p>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 px-2">{page} / {pages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === pages}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modalOpen && <MemberModal member={selected} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Member"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
