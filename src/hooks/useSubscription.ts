'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SubscriptionInfo } from '@/types';

type Resource = 'members' | 'staff' | 'services';

export function useSubscription() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    api.subscription.get().then(setInfo).catch(() => {});
  }, []);

  const isAtLimit = (resource: Resource) =>
    info ? info.usage[resource] >= info.limits[resource] : false;

  const isNearLimit = (resource: Resource) =>
    info ? !isAtLimit(resource) && info.usage[resource] / info.limits[resource] >= 0.8 : false;

  const usageLabel = (resource: Resource) =>
    info ? `${info.usage[resource]}/${info.limits[resource]}` : null;

  return { info, isAtLimit, isNearLimit, usageLabel };
}
