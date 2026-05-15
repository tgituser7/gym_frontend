'use client';

import { useEffect, useState } from 'react';
import { Users, Dumbbell, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/dates';
import { api } from '@/lib/api';
import { SubscriptionInfo } from '@/types';

export default function SubscriptionPage() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.subscription.get()
      .then(setInfo)
      .catch(() => setError('Failed to load subscription info'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!info) return (
    <div className="text-center text-gray-500 py-16">{error || 'No subscription data found.'}</div>
  );

  const { tier, subscription, usage, limits } = info;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">Your current tier and usage</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{tier.name} Tier</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                subscription.status === 'active' ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Started {formatDate(subscription.startDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ₹{tier.basePrice.toLocaleString()}<span className="text-sm font-normal text-gray-500">/month</span>
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <UsageBar icon={<Users className="w-4 h-4" />} label="Members" used={usage.members} limit={limits.members} />
          <UsageBar icon={<Dumbbell className="w-4 h-4" />} label="Services" used={usage.services} limit={limits.services} />
          <UsageBar icon={<UserCheck className="w-4 h-4" />} label="Staff" used={usage.staff} limit={limits.staff} />
        </div>
      </div>

      <p className="text-sm text-gray-500">
        To increase limits or change your subscription tier, contact us at{' '}
        <a href="mailto:hello.flexms@gmail.com" className="text-orange-500 hover:text-orange-600 font-medium">
          hello.flexms@gmail.com
        </a>
      </p>
    </div>
  );
}

function UsageBar({ icon, label, used, limit }: { icon: React.ReactNode; label: string; used: number; limit: number }) {
  const pct = limit === 0 ? 0 : Math.min((used / limit) * 100, 100);
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">{icon} {label}</div>
        <span className="text-sm font-medium text-gray-900">{used} / {limit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
