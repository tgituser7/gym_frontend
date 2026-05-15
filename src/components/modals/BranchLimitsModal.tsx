'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Branch, SubscriptionTier } from '@/types';
import ModalShell from '../ModalShell';

interface Props {
  branch: Branch;
  tier: SubscriptionTier;
  onClose: () => void;
  onSaved: () => void;
}

const FORM_ID = 'branch-limits-form';

export default function BranchLimitsModal({ branch, tier, onClose, onSaved }: Props) {
  const sub = branch.subscription;
  const [addMembers, setAddMembers] = useState(sub?.additionalMembers ?? 0);
  const [addStaff, setAddStaff] = useState(sub?.additionalStaff ?? 0);
  const [addServices, setAddServices] = useState(sub?.additionalServices ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const effectiveMembers = tier.memberLimit + addMembers;
  const effectiveStaff = tier.staffLimit + addStaff;
  const effectiveServices = tier.serviceLimit + addServices;

  const adjust = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    setter((v) => Math.max(0, v + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.subscription.setBranchLimits(branch._id, {
        additionalMembers: addMembers,
        additionalStaff: addStaff,
        additionalServices: addServices,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update limits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={`Limits — ${branch.name}`} formId={FORM_ID} onClose={onClose} loading={loading} submitLabel="Save Limits">
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}

        <p className="text-sm text-gray-500">
          Base tier: <span className="font-medium text-gray-700">{tier.memberLimit} members · {tier.staffLimit} staff · {tier.serviceLimit} services</span>
        </p>

        <LimitRow
          label="Members"
          base={tier.memberLimit}
          additional={addMembers}
          effective={effectiveMembers}
          onDecrease={() => adjust(setAddMembers, -1)}
          onIncrease={() => adjust(setAddMembers, 1)}
        />
        <LimitRow
          label="Staff"
          base={tier.staffLimit}
          additional={addStaff}
          effective={effectiveStaff}
          onDecrease={() => adjust(setAddStaff, -1)}
          onIncrease={() => adjust(setAddStaff, 1)}
        />
        <LimitRow
          label="Services"
          base={tier.serviceLimit}
          additional={addServices}
          effective={effectiveServices}
          onDecrease={() => adjust(setAddServices, -1)}
          onIncrease={() => adjust(setAddServices, 1)}
        />
      </form>
    </ModalShell>
  );
}

function LimitRow({
  label, base, additional, effective, onDecrease, onIncrease,
}: {
  label: string;
  base: number;
  additional: number;
  effective: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">Base {base} + {additional} extra = <span className="font-semibold text-orange-600">{effective}</span></p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDecrease} disabled={additional === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-10 text-center font-semibold text-gray-900 text-sm">{effective}</span>
        <button type="button" onClick={onIncrease}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-600 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
