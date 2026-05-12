'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Service, Staff } from '@/types';
import ModalShell from '../ModalShell';

interface Props { service: Service | null; onClose: () => void; onSaved: (service: Service) => void; }

const CATEGORIES = ['Yoga', 'Strength', 'Swimming', 'Martial Arts', 'Dance', 'Nutrition', 'Other'] as const;
const FORM_ID = 'service-form';

const EMPTY = {
  name: '', description: '',
  price: '' as number | string, duration: '' as number | string,
  instructor: '', category: 'Other' as Service['category'],
  schedule: '', maxCapacity: '' as number | string,
  status: 'active' as Service['status'],
};

export default function ServiceModal({ service, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.staff.list({ status: 'active' }).then(setStaffList).catch(() => {}); }, []);

  useEffect(() => {
    setForm(service ? {
      name: service.name, description: service.description || '',
      price: service.price, duration: service.duration ?? '',
      instructor: (service.instructor as Staff | undefined)?._id || '',
      category: service.category, schedule: service.schedule || '',
      maxCapacity: service.maxCapacity ?? '', status: service.status,
    } : { ...EMPTY });
  }, [service]);

  const set = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration: form.duration !== '' ? Number(form.duration) : undefined,
        maxCapacity: form.maxCapacity !== '' ? Number(form.maxCapacity) : undefined,
        instructor: form.instructor || undefined,
      };
      const saved = service ? await api.services.update(service._id, payload) : await api.services.create(payload);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title={service ? 'Edit Service' : 'Add Service'} formId={FORM_ID} onClose={onClose} loading={loading} submitLabel={service ? 'Save Changes' : 'Add Service'}>
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Service Name *</label><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div><label className="label">Price (₹) *</label><input className="input" type="number" required min="0" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
          <div><label className="label">Duration (months)</label><input className="input" type="number" min="1" value={form.duration} onChange={(e) => set('duration', e.target.value)} /></div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Max Capacity</label><input className="input" type="number" min="1" value={form.maxCapacity} onChange={(e) => set('maxCapacity', e.target.value)} /></div>
          <div className="sm:col-span-2">
            <label className="label">Instructor / Staff</label>
            <select className="input" value={form.instructor} onChange={(e) => set('instructor', e.target.value)}>
              <option value="">No instructor assigned</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>{s.name} — {s.role}{s.specialization ? ` (${s.specialization})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Schedule</label><input className="input" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} placeholder="e.g. Mon, Wed, Fri · 7:00 AM – 8:00 AM" /></div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
