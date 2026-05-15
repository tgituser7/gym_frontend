'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Branch, Staff } from '@/types';
import ModalShell from '../ModalShell';

interface Props { branch: Branch | null; onClose: () => void; onSaved: (branch: Branch) => void; }

const FORM_ID = 'branch-form';

const EMPTY = {
  name: '', address: '', city: '', state: '',
  phone: '', email: '', password: '', openingHours: '', manager: '',
  status: 'active' as Branch['status'], notes: '',
};

export default function BranchModal({ branch, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isNew = !branch;

  useEffect(() => { api.staff.list({ status: 'active' }).then(setStaffList).catch(() => {}); }, []);

  useEffect(() => {
    setForm(branch ? {
      name: branch.name, address: branch.address,
      city: branch.city || '', state: branch.state || '',
      phone: branch.phone || '', email: branch.email || '',
      password: '',
      openingHours: branch.openingHours || '',
      manager: (branch.manager as Staff | undefined)?._id || '',
      status: branch.status, notes: branch.notes || '',
    } : { ...EMPTY });
  }, [branch]);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { password, ...rest } = form;
      const payload = {
        ...rest,
        manager: rest.manager || undefined,
        ...(password ? { password } : {}),
      };
      const saved = branch ? await api.branches.update(branch._id, payload) : await api.branches.create(payload);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title={isNew ? 'Add Branch' : 'Edit Branch'} formId={FORM_ID} onClose={onClose} loading={loading} submitLabel={isNew ? 'Add Branch' : 'Save Changes'}>
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Branch Name *</label><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Downtown Branch" /></div>
          <div className="sm:col-span-2"><label className="label">Address *</label><input className="input" required value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
          <div><label className="label">State / Province</label><input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div>
            <label className="label">Login Email *</label>
            <input className="input" type="email" required={isNew} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="branch@gym.com" />
          </div>
          <div>
            <label className="label">{isNew ? 'Password *' : 'New Password'}</label>
            <input className="input" type="password" required={isNew} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={isNew ? 'Min. 6 characters' : 'Leave blank to keep current'} />
          </div>
          <div className="sm:col-span-2"><label className="label">Opening Hours</label><input className="input" value={form.openingHours} onChange={(e) => set('openingHours', e.target.value)} placeholder="e.g. Mon-Fri 6AM-10PM, Sat-Sun 8AM-8PM" /></div>
          <div className="sm:col-span-2">
            <label className="label">Branch Manager</label>
            <select className="input" value={form.manager} onChange={(e) => set('manager', e.target.value)}>
              <option value="">No manager assigned</option>
              {staffList.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.role}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
        </div>
      </form>
    </ModalShell>
  );
}
