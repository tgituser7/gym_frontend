'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, CheckCircle, Send, ArrowLeft } from 'lucide-react';
import FitarkLogo from '@/components/FitarkLogo';

export default function ChatPage() {
  const [form, setForm] = useState({
    name: '',
    gymName: '',
    city: '',
    mobile: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <FitarkLogo size={36} />
          <span className="font-bold text-xl">Fitark</span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left panel */}
            <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl p-8 flex flex-col gap-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">Let's talk</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Interested in Fitark for your gym? Fill in your details and we'll get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">Email</p>
                    <a
                      href="mailto:hello.flexms@gmail.com"
                      className="text-sm text-slate-200 hover:text-white transition-colors"
                    >
                      hello.flexms@gmail.com
                    </a>
                  </div>
                </div>

<div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">Based in</p>
                    <p className="text-sm text-slate-200">India</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right — form */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', gymName: '', city: '', mobile: '', email: '', message: '' });
                    }}
                    className="mt-8 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Chat with us</h2>
                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Your Name *</label>
                        <input
                          className="input"
                          required
                          placeholder="John Doe"
                          value={form.name}
                          onChange={(e) => set('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Mobile Number *</label>
                        <input
                          className="input"
                          required
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.mobile}
                          onChange={(e) => set('mobile', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="label">Email Address</label>
                      <input
                        className="input"
                        type="email"
                        placeholder="you@yourgym.com"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                      />
                    </div>

                    {/* Gym Name + City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Gym Name *</label>
                        <input
                          className="input"
                          required
                          placeholder="FitLife Gym"
                          value={form.gymName}
                          onChange={(e) => set('gymName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">City</label>
                        <input
                          className="input"
                          placeholder="Mumbai"
                          value={form.city}
                          onChange={(e) => set('city', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="label">Message *</label>
                      <textarea
                        className="input resize-none"
                        required
                        rows={4}
                        placeholder="Tell us about your gym — how many members, what you're looking for, any questions…"
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full justify-center py-3 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Fitark. All rights reserved.
      </footer>
    </div>
  );
}
