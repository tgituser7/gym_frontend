'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Step = 1 | 2;

export default function RegisterPage() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    website: '',
    description: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = form;
      void confirmPassword;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      login(data.token, data.branch);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">FlexMS</span>
        </div>

        <div className="card">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Create your gym account' : 'Gym details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 ? 'Step 1 of 2 — Account credentials' : 'Step 2 of 2 — Location & info'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="label">Gym Name *</label>
                <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. FitLife Gym" />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="admin@gym.com" />
              </div>
              <div>
                <label className="label">Password *</label>
                <input className="input" type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input className="input" type="password" required value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Re-enter password" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3 mt-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="label">Address</label>
                  <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div>
                  <label className="label">State / Province</label>
                  <input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" value={form.country} onChange={(e) => set('country', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Tell members about your gym..." />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center py-3" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register Gym'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already registered?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
