'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Staff, Service } from '@/types';
import ModalShell from '../ModalShell';

interface Props { staff: Staff | null; onClose: () => void; onSaved: (staff: Staff) => void; }

const ROLES = ['Trainer', 'Instructor', 'Manager', 'Receptionist', 'Maintenance', 'Nutritionist', 'Other'] as const;
const FORM_ID = 'staff-form';

const EMPTY = {
  name: '', email: '', phone: '',
  role: 'Trainer' as Staff['role'],
  specialization: '', salary: '' as number | string,
  joinDate: new Date().toISOString().split('T')[0],
  status: 'active' as Staff['status'], notes: '',
};

const CATEGORY_COLORS: Record<string, string> = {
  Yoga: 'bg-purple-100 text-purple-700',
  Cardio: 'bg-red-100 text-red-700',
  Strength: 'bg-blue-100 text-blue-700',
  Pilates: 'bg-pink-100 text-pink-700',
  Swimming: 'bg-cyan-100 text-cyan-700',
  CrossFit: 'bg-orange-100 text-orange-700',
  'Martial Arts': 'bg-yellow-100 text-yellow-700',
  Dance: 'bg-fuchsia-100 text-fuchsia-700',
  Nutrition: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-600',
};

export default function StaffModal({ staff, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [assignedServices, setAssignedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(staff ? {
      name: staff.name, email: staff.email, phone: staff.phone || '',
      role: staff.role, specialization: staff.specialization || '',
      salary: staff.salary ?? '', joinDate: staff.joinDate.split('T')[0],
      status: staff.status, notes: staff.notes || '',
    } : { ...EMPTY });

    if (staff) {
      api.services.list().then((svcs) => {
        setAssignedServices(svcs.filter((s) => {
          const inst = s.instructor;
          if (!inst) return false;
          return typeof inst === 'string' ? inst === staff._id : (inst as Staff)._id === staff._id;
        }));
      }).catch(() => {});
    } else {
      setAssignedServices([]);
    }
  }, [staff]);

  const set = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, salary: form.salary !== '' ? Number(form.salary) : undefined };
      const saved = staff ? await api.staff.update(staff._id, payload) : await api.staff.create(payload);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <ModalShell title={staff ? 'Edit Staff Member' : 'Add Staff Member'} formId={FORM_ID} onClose={onClose} loading={loading} submitLabel={staff ? 'Save Changes' : 'Add Staff'}>
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Full Name *</label><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div>
            <label className="label">Role *</label>
            <select className="input" required value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div><label className="label">Specialization</label><input className="input" value={form.specialization} onChange={(e) => set('specialization', e.target.value)} placeholder="e.g. Yoga, HIIT, Boxing" /></div>
          <div><label className="label">Salary (₹)</label><input className="input" type="number" min="0" value={form.salary} onChange={(e) => set('salary', e.target.value)} /></div>
          <div><label className="label">Join Date</label><input className="input" type="date" value={form.joinDate} onChange={(e) => set('joinDate', e.target.value)} /></div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
        </div>
      </form>

      {staff && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Assigned Services</p>
          {assignedServices.length === 0 ? (
            <p className="text-sm text-gray-400">No services assigned as instructor.</p>
          ) : (
            <div className="space-y-2">
              {assignedServices.map((s) => (
                <div key={s._id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">₹{s.price.toLocaleString()}{s.schedule ? ` · ${s.schedule}` : ''}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.Other}`}>
                    {s.category}
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
