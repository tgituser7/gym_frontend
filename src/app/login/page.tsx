'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token, data.branch);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Fitark</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage your gym, <span className="text-orange-400">effortlessly.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Multi-branch support, member management, staff tracking, services, and automated fee collection — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Members', desc: 'Track & manage' },
              { label: 'Branches', desc: 'Multi-location' },
              { label: 'Staff', desc: 'Roles & schedules' },
              { label: 'Fees', desc: 'Auto-overdue' },
            ].map((f) => (
              <div key={f.label} className="bg-slate-800 rounded-xl p-4">
                <p className="font-semibold text-white">{f.label}</p>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Fitark</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in with your branch credentials</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                required
                placeholder="gym@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New gym?{' '}
            <Link href="/register" className="text-orange-500 hover:text-orange-600 font-medium">
              Register your gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
