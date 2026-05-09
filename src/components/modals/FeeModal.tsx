'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Fee, Member, Service } from '@/types';
import { todayInputDate, isoToInputDate, inputDateToISO } from '@/lib/dates';
import ModalShell from '../ModalShell';

interface Props { fee: Fee | null; onClose: () => void; onSaved: (fee: Fee) => void; }

const FORM_ID = 'fee-form';

const EMPTY = {
  member: '', amount: '' as number | string, description: '',
  dueDate: todayInputDate(), paymentDate: '',
  status: 'paid' as Fee['status'],
  paymentMethod: '' as Fee['paymentMethod'] | '',
  services: [] as string[],
};

export default function FeeModal({ fee, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [members, setMembers] = useState<Member[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.members.list({ status: 'active' }), api.services.list({ status: 'active' })])
      .then(([m, s]) => { setMembers(m); setServices(s); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (fee) {
      const memberId = typeof fee.member === 'string' ? fee.member : (fee.member as Member)._id;
      const svcIds = ((fee.services || []) as Service[]).map((s) => (typeof s === 'string' ? s : s._id));
      setForm({
        member: memberId, amount: fee.amount, description: fee.description || '',
        dueDate: isoToInputDate(fee.dueDate),
        paymentDate: fee.paymentDate ? isoToInputDate(fee.paymentDate) : '',
        status: fee.status, paymentMethod: fee.paymentMethod || '', services: svcIds,
      });
    } else {
      setForm({ ...EMPTY });
    }
  }, [fee]);

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
        ...form, amount: Number(form.amount),
        dueDate: inputDateToISO(form.dueDate),
        paymentDate: form.paymentDate ? inputDateToISO(form.paymentDate) : undefined,
        paymentMethod: form.paymentMethod || undefined,
      };
      const saved = fee ? await api.fees.update(fee._id, payload) : await api.fees.create(payload);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title={fee ? 'Edit Fee Record' : 'Add Fee Record'} formId={FORM_ID} onClose={onClose} loading={loading} submitLabel={fee ? 'Save Changes' : 'Add Fee'}>
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Member *</label>
            <select className="input" required value={form.member} onChange={(e) => set('member', e.target.value)}>
              <option value="">Select member</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name} — {m.email}</option>)}
            </select>
          </div>
          <div><label className="label">Amount (₹) *</label><input className="input" type="number" required min="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} /></div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {fee && <option value="pending">Due</option>}
              <option value="paid">Paid</option>
              {fee && <option value="overdue">Overdue</option>}
            </select>
          </div>
          <div><label className="label">Due Date *</label><input className="input" type="date" required value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></div>
          <div><label className="label">Payment Date</label><input className="input" type="date" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} /></div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
              <option value="">Not specified</option>
              <option value="cash">Cash</option><option value="card">Card</option>
              <option value="online">Online</option><option value="other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="e.g. Monthly membership fee" /></div>
        </div>
        <div>
          <label className="label">Services (optional)</label>
          {services.length === 0 ? <p className="text-sm text-gray-400">No active services.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {services.map((s) => (
                <label key={s._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.services.includes(s._id) ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" className="mt-0.5 accent-orange-500" checked={form.services.includes(s._id)} onChange={() => toggleService(s._id)} />
                  <div><p className="text-sm font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-500">₹{s.price} · {s.category}</p></div>
                </label>
              ))}
            </div>
          )}
        </div>
      </form>
    </ModalShell>
  );
}
