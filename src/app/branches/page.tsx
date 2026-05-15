'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, AlertCircle, MapPin, Phone, Clock, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { Branch, SubscriptionTier } from '@/types';
import BranchModal from '@/components/modals/BranchModal';
import BranchLimitsModal from '@/components/modals/BranchLimitsModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [limitsTarget, setLimitsTarget] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, tierData] = await Promise.all([
        api.branches.list(),
        api.subscription.getTier(),
      ]);
      setBranches(data);
      setTier(tierData);
    } catch {
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.branches.delete(deleteTarget._id);
      setBranches((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete branch');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = (branch: Branch) => {
    setBranches((prev) => {
      const idx = prev.findIndex((b) => b._id === branch._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = branch;
        return next;
      }
      return [branch, ...prev];
    });
    setModalOpen(false);
  };

  const handleLimitsSaved = () => {
    setLimitsTarget(null);
    fetchBranches();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Branches</h2>
          <p className="text-gray-500 text-sm mt-1">{branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : branches.length === 0 ? (
        <div className="card text-center py-16">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No branches yet</h3>
          <p className="text-gray-500 mb-6">Add your first branch to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((b) => {
            const manager = b.manager as { name: string; role: string } | undefined;
            const sub = b.subscription;
            const memberLimit = tier ? tier.memberLimit + (sub?.additionalMembers ?? 0) : null;
            const staffLimit = tier ? tier.staffLimit + (sub?.additionalStaff ?? 0) : null;
            const serviceLimit = tier ? tier.serviceLimit + (sub?.additionalServices ?? 0) : null;
            return (
              <div key={b._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{b.name}</h3>
                    <span className={b.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLimitsTarget(b)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit limits"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelected(b); setModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(b)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <span>
                      {b.address}
                      {b.city && `, ${b.city}`}
                      {b.state && `, ${b.state}`}
                    </span>
                  </div>
                  {b.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                      <span>{b.phone}</span>
                    </div>
                  )}
                  {b.openingHours && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                      <span>{b.openingHours}</span>
                    </div>
                  )}

                  {tier && (
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Members</p>
                        <p className="font-semibold text-gray-900 text-sm">{memberLimit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Staff</p>
                        <p className="font-semibold text-gray-900 text-sm">{staffLimit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Services</p>
                        <p className="font-semibold text-gray-900 text-sm">{serviceLimit}</p>
                      </div>
                    </div>
                  )}

                  {manager && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Branch Manager</p>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-xs text-gray-500">{manager.role}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <BranchModal branch={selected} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
      {limitsTarget && tier && (
        <BranchLimitsModal
          branch={limitsTarget}
          tier={tier}
          onClose={() => setLimitsTarget(null)}
          onSaved={handleLimitsSaved}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Branch"
          message={`Delete branch "${deleteTarget.name}"? Existing members and staff linked to this branch will not be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
