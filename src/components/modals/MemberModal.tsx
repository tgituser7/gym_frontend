'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Member, Service, Fee } from '@/types';
import { todayInputDate, isoToInputDate, inputDateToISO, formatDate } from '@/lib/dates';
import ModalShell from '../ModalShell';

interface Props {
  member: Member | null;
  onClose: () => void;
  onSaved: (member: Member) => void;
}

const FORM_ID = 'member-form';

const EMPTY = {
  name: '', email: '', phone: '', address: '',
  dateOfBirth: '', gender: '' as Member['gender'] | '',
  membershipStartDate: todayInputDate(),
  membershipEndDate: '',
  services: [] as string[],
  status: 'active' as Member['status'],
  emergencyContact: '', notes: '',
};

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending: 'Due',
  overdue: 'Overdue',
};

export default function MemberModal({ member, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [services, setServices] = useState<Service[]>([]);
  const [recentFees, setRecentFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.services.list({ status: 'active' }).then(setServices).catch(() => {}); }, []);

  useEffect(() => {
    if (member) {
      const svcIds = (member.services as Service[]).map((s) => (typeof s === 'string' ? s : s._id));
      setForm({
        name: member.name, email: member.email || '',
        phone: member.phone || '', address: member.address || '',
        dateOfBirth: member.dateOfBirth ? isoToInputDate(member.dateOfBirth) : '',
        gender: member.gender || '',
        membershipStartDate: isoToInputDate(member.membershipStartDate),
        membershipEndDate: member.membershipEndDate ? isoToInputDate(member.membershipEndDate) : '',
        services: svcIds, status: member.status,
        emergencyContact: member.emergencyContact || '', notes: member.notes || '',
      });
      api.fees.list({ memberId: member._id })
        .then((fees) => setRecentFees(fees.slice(0, 5)))
        .catch(() => {});
    } else {
      setForm({ ...EMPTY });
      setRecentFees([]);
    }
  }, [member]);

  const set = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const toggleService = (id: string) =>
    setForm((p) => ({
      ...p,
      services: p.services.includes(id) ? p.services.filter((s) => s !== id) : [...p.services, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        email: form.email || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth ? inputDateToISO(form.dateOfBirth) : undefined,
        membershipStartDate: inputDateToISO(form.membershipStartDate),
        membershipEndDate: form.membershipEndDate ? inputDateToISO(form.membershipEndDate) : undefined,
      };
      const saved = member ? await api.members.update(member._id, payload) : await api.members.create(payload);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title={member ? 'Edit Member' : 'Add New Member'}
      formId={FORM_ID}
      onClose={onClose}
      loading={loading}
      submitLabel={member ? 'Save Changes' : 'Add Member'}
      maxWidth="max-w-2xl"
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Full Name *</label><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Date of Birth</label><input className="input" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} /></div>
          <div><label className="label">Emergency Contact</label><input className="input" value={form.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          <div><label className="label">Membership Start *</label><input className="input" type="date" required value={form.membershipStartDate} onChange={(e) => set('membershipStartDate', e.target.value)} /></div>
          <div><label className="label">Membership End</label><input className="input" type="date" value={form.membershipEndDate} onChange={(e) => set('membershipEndDate', e.target.value)} /></div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Assigned Services</label>
          {services.length === 0 ? (
            <p className="text-sm text-gray-400">No active services available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {services.map((s) => (
                <label key={s._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.services.includes(s._id) ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" className="mt-0.5 accent-orange-500" checked={form.services.includes(s._id)} onChange={() => toggleService(s._id)} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">₹{s.price} · {s.category}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div><label className="label">Notes</label><textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      </form>

      {member && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recent Fees</p>
          {recentFees.length === 0 ? (
            <p className="text-sm text-gray-400">No fees recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentFees.map((f) => (
                <div key={f._id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">₹{f.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{f.description || 'Fee'} · Due {formatDate(f.dueDate)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[f.status]}`}>
                    {STATUS_LABELS[f.status] ?? f.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}
