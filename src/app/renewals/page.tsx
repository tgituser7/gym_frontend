'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, MessageCircle, Phone, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime } from 'luxon';
import { api } from '@/lib/api';
import { Member, Service, Gym } from '@/types';
import { formatDate } from '@/lib/dates';
import { useAuth } from '@/context/AuthContext';

const PAGE_LIMIT = 20;

// days=0 means "all" (no upper bound)
const WINDOWS = [
  { label: '3 days', days: 3, key: 'days3' as const },
  { label: '7 days', days: 7, key: 'days7' as const },
  { label: '14 days', days: 14, key: 'days14' as const },
  { label: '30 days', days: 30, key: 'days30' as const },
  { label: 'All', days: 0, key: 'total' as const },
];

type Summary = { days3: number; days7: number; days14: number; days30: number; total: number };

function daysUntil(iso: string): number {
  return Math.ceil(
    DateTime.fromISO(iso, { zone: 'utc' }).diff(DateTime.now().toUTC().startOf('day'), 'days').days
  );
}

function urgencyClass(d: number): string {
  if (d < 0) return 'bg-red-100 text-red-700';
  if (d <= 2) return 'bg-red-100 text-red-700';
  if (d <= 7) return 'bg-yellow-100 text-yellow-700';
  return 'bg-blue-100 text-blue-700';
}

function daysLabel(d: number): string {
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Today';
  return `${d}d left`;
}

function buildWhatsAppLink(
  phone: string,
  name: string,
  gymName: string,
  branchName: string,
  expiry: string,
  services: Service[],
): string {
  const digits = phone.replace(/\D/g, '');
  const number = digits.length === 10 ? `91${digits}` : digits;
  const svcLines = services.length > 0
    ? services.map((s) => `  • ${s.name}`).join('\n')
    : '  • General Membership';
  const msg =
    `Hi ${name}! 👋\n\n` +
    `Your membership at ${gymName} (${branchName}) is expiring on ${expiry}.\n\n` +
    `Services due for renewal:\n${svcLines}\n\n` +
    `Please renew at the earliest to continue enjoying our services.\n\n` +
    `Thank you! 💪`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

export default function RenewalsPage() {
  const { branch } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<Summary>({ days3: 0, days7: 0, days14: 0, days30: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  const fetchRenewals = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.members.renewals({ days, page, limit: PAGE_LIMIT });
      setMembers(res.members);
      setTotal(res.total);
      setPages(res.pages);
      setSummary(res.summary);
    } catch {
      setError('Failed to load renewal data');
    } finally { setLoading(false); }
  }, [days, page]);

  useEffect(() => { fetchRenewals(); }, [fetchRenewals]);

  const handleWindowChange = (d: number) => { setDays(d); setPage(1); };

  const gymName = branch ? ((branch.gym as Gym)?.name ?? branch.name) : 'our gym';
  const branchName = branch?.name || 'our gym';

  const from = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const to = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Renewals</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {total} member{total !== 1 ? 's' : ''} {days === 0 ? 'pending renewal' : `expiring within ${days} days`}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Window selector stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {WINDOWS.map((w) => {
          const count = summary[w.key];
          const isActive = days === w.days;
          return (
            <button
              key={w.days}
              onClick={() => handleWindowChange(w.days)}
              className={`card p-3 text-left transition-all ${
                isActive
                  ? 'ring-2 ring-orange-500 bg-orange-50'
                  : 'hover:shadow-md'
              }`}
            >
              <p className={`text-xl sm:text-2xl font-bold ${isActive ? 'text-orange-600' : 'text-gray-900'}`}>
                {loading ? '–' : count}
              </p>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                {w.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
            <Bell className="w-8 h-8" />
            <p className="text-sm">No memberships pending renewal in this window.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {members.map((m) => {
                const services = m.services as Service[];
                const d = daysUntil(m.membershipEndDate!);
                const expiry = formatDate(m.membershipEndDate!);
                return (
                  <div key={m._id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyClass(d)}`}>
                            {daysLabel(d)}
                          </span>
                        </div>
                        {m.phone && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{m.phone}
                          </p>
                        )}
                        {m.email && <p className="text-xs text-gray-400 truncate">{m.email}</p>}
                        <p className="text-xs text-gray-400 mt-1">Expires {expiry}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {services.length === 0 ? (
                            <span className="text-xs text-gray-400">No services</span>
                          ) : (
                            services.map((s) => (
                              <span key={s._id} className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{s.name}</span>
                            ))
                          )}
                        </div>
                      </div>
                      {m.phone && (
                        <a
                          href={buildWhatsAppLink(m.phone, m.name, gymName, branchName, expiry, services)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors mt-0.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Member</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Services</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((m) => {
                    const services = m.services as Service[];
                    const d = daysUntil(m.membershipEndDate!);
                    const expiry = formatDate(m.membershipEndDate!);
                    return (
                      <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{m.name}</p>
                          {m.email && <p className="text-xs text-gray-400">{m.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.phone || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {services.length === 0 ? (
                              <span className="text-gray-400">None</span>
                            ) : (
                              <>
                                {services.slice(0, 3).map((s) => (
                                  <span key={s._id} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{s.name}</span>
                                ))}
                                {services.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">+{services.length - 3}</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{expiry}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyClass(d)}`}>
                            {daysLabel(d)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            {m.phone ? (
                              <a
                                href={buildWhatsAppLink(m.phone, m.name, gymName, branchName, expiry, services)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            ) : (
                              <span className="text-xs text-gray-300 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> No number
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{from}–{to} of {total}</p>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 px-2">{page} / {pages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === pages}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
