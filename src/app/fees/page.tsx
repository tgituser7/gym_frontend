'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Fee, Member } from '@/types';
import FeeModal from '@/components/modals/FeeModal';
import ConfirmDialog from '@/components/ConfirmDialog';

const STATUS_ICONS = {
  paid: <CheckCircle className="w-4 h-4 text-green-500" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  overdue: <XCircle className="w-4 h-4 text-red-500" />,
};

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Fee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Fee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.fees.list({ status: statusFilter });
      setFees(data);
    } catch {
      setError('Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.fees.delete(deleteTarget._id);
      setFees((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete fee');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = (item: Fee) => {
    setFees((prev) => {
      const idx = prev.findIndex((f) => f._id === item._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
    setModalOpen(false);
  };

  const totalPaid = fees.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter((f) => f.status !== 'paid').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fees</h2>
          <p className="text-gray-500 text-sm mt-1">{fees.length} records</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setSelected(null); setModalOpen(true); }}
        >
          <Plus className="w-4 h-4" /> Add Fee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-3 p-4">
          <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Collected</p>
            <p className="text-xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-yellow-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-xl font-bold text-gray-900">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Overdue Count</p>
            <p className="text-xl font-bold text-gray-900">
              {fees.filter((f) => f.status === 'overdue').length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="card p-4">
        <select
          className="input w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Member</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Payment Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No fees found.</td></tr>
              ) : (
                fees.map((f) => {
                  const member = f.member as Member;
                  return (
                    <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{member?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{member?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {f.description || '-'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{f.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{f.paymentMethod || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {STATUS_ICONS[f.status]}
                          <span className={`badge-${f.status}`}>{f.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelected(f); setModalOpen(true); }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(f)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {modalOpen && (
        <FeeModal
          fee={selected}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Fee Record"
          message="Are you sure you want to delete this fee record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
