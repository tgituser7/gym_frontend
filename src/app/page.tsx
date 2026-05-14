'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Dumbbell, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatDate } from '@/lib/dates';

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.stats
      .get()
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
        <AlertCircle className="w-5 h-5" /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome to Fitark</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats!.totalMembers}
          sub={`${stats!.activeMembers} active`}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Staff"
          value={stats!.totalStaff}
          sub={`${stats!.activeStaff} active`}
          icon={UserCheck}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Services"
          value={stats!.totalServices}
          icon={Dumbbell}
          color="bg-orange-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats!.monthlyRevenue.toLocaleString()}`}
          sub={`₹${stats!.pendingAmount.toLocaleString()} due`}
          icon={TrendingUp}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Recent Members
          </h3>
          {stats!.recentMembers.length === 0 ? (
            <p className="text-gray-400 text-sm">No members yet.</p>
          ) : (
            <div className="space-y-3">
              {stats!.recentMembers.map((m) => (
                <div key={m._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <span className={m.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" /> Upcoming / Overdue Fees
          </h3>
          {stats!.upcomingDues.length === 0 ? (
            <p className="text-gray-400 text-sm">No due fees.</p>
          ) : (
            <div className="space-y-3">
              {stats!.upcomingDues.map((f) => {
                const member = f.member as { name: string; email: string };
                return (
                  <div key={f._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400">
                        Due: {formatDate(f.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{f.amount.toLocaleString()}
                      </p>
                      <span className={f.status === 'overdue' ? 'badge-overdue' : 'badge-pending'}>
                        {f.status === 'pending' ? 'Due' : f.status === 'overdue' ? 'Overdue' : 'Settled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
