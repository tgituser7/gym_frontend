import { Member, Staff, Service, Fee, Branch, DashboardStats, SubscriptionTier, SubscriptionInfo } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string | null): void {
  _token = token;
}

export function setOnUnauthorized(cb: (() => void) | null): void {
  _onUnauthorized = cb;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      ...(extraHeaders as Record<string, string> | undefined),
    },
    ...restOptions,
  });
  if (res.status === 401) {
    _onUnauthorized?.();
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error: string }).error || 'Request failed');
  }
  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') merged[k] = v;
  }
  const q = new URLSearchParams(merged).toString();
  return q ? `?${q}` : '';
}

export const api = {
  stats: {
    get: () => request<DashboardStats>('/stats'),
  },

  branches: {
    list: (params?: { status?: string }) =>
      request<Branch[]>(`/branches${buildQuery(params ?? {})}`),
    get: (id: string) => request<Branch>(`/branches/${id}`),
    create: (data: Partial<Branch> & { password?: string }) =>
      request<Branch>('/branches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Branch> & { password?: string }) =>
      request<Branch>(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/branches/${id}`, { method: 'DELETE' }),
  },

  members: {
    list: (params?: { search?: string; status?: string }) =>
      request<Member[]>(`/members${buildQuery(params ?? {})}`),
    listPaged: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
      request<{ members: Member[]; total: number; page: number; pages: number }>(
        `/members${buildQuery({ search: params?.search, status: params?.status, page: params?.page?.toString(), limit: params?.limit?.toString() })}`
      ),
    get: (id: string) => request<Member>(`/members/${id}`),
    renewals: (params?: { days?: number; page?: number; limit?: number }) =>
      request<{ members: Member[]; total: number; page: number; pages: number; summary: { days3: number; days7: number; days14: number; days30: number; total: number } }>(
        `/members/renewals${buildQuery({ days: params?.days?.toString(), page: params?.page?.toString(), limit: params?.limit?.toString() })}`
      ),
    create: (data: Partial<Member>) =>
      request<Member>('/members', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Member>) =>
      request<Member>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/members/${id}`, { method: 'DELETE' }),
  },

  staff: {
    list: (params?: { search?: string; status?: string; role?: string }) =>
      request<Staff[]>(`/staff${buildQuery(params ?? {})}`),
    listPaged: (params?: { search?: string; status?: string; role?: string; page?: number; limit?: number }) =>
      request<{ staff: Staff[]; total: number; page: number; pages: number }>(
        `/staff${buildQuery({ search: params?.search, status: params?.status, role: params?.role, page: params?.page?.toString(), limit: params?.limit?.toString() })}`
      ),
    get: (id: string) => request<Staff>(`/staff/${id}`),
    create: (data: Partial<Staff>) =>
      request<Staff>('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Staff>) =>
      request<Staff>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/staff/${id}`, { method: 'DELETE' }),
  },

  services: {
    list: (params?: { search?: string; status?: string; category?: string }) =>
      request<Service[]>(`/services${buildQuery(params ?? {})}`),
    listPaged: (params?: { search?: string; status?: string; category?: string; page?: number; limit?: number }) =>
      request<{ services: Service[]; total: number; page: number; pages: number }>(
        `/services${buildQuery({ search: params?.search, status: params?.status, category: params?.category, page: params?.page?.toString(), limit: params?.limit?.toString() })}`
      ),
    get: (id: string) => request<Service>(`/services/${id}`),
    create: (data: Partial<Service>) =>
      request<Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Service>) =>
      request<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/services/${id}`, { method: 'DELETE' }),
  },

  fees: {
    list: (params?: { status?: string; memberId?: string }) =>
      request<Fee[]>(`/fees${buildQuery(params ?? {})}`),
    listPaged: (params?: { status?: string; page?: number; limit?: number }) =>
      request<{ fees: Fee[]; total: number; page: number; pages: number; summary: { totalPaid: number; totalOutstanding: number; overdueCount: number } }>(
        `/fees${buildQuery({ status: params?.status, page: params?.page?.toString(), limit: params?.limit?.toString() })}`
      ),
    get: (id: string) => request<Fee>(`/fees/${id}`),
    create: (data: Partial<Fee>) =>
      request<Fee>('/fees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Fee>) =>
      request<Fee>(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/fees/${id}`, { method: 'DELETE' }),
  },

  subscription: {
    getTier: () => request<SubscriptionTier>('/subscription/tier'),
    get: () => request<SubscriptionInfo>('/subscription'),
    updateAddon: (additionalMembers: number) =>
      request<{ additionalMembers: number; additionalAmount: number; effectiveMemberLimit: number; totalMonthlyAmount: number }>(
        '/subscription/addon',
        { method: 'PUT', body: JSON.stringify({ additionalMembers }) }
      ),
    setBranchLimits: (branchId: string, limits: { additionalMembers?: number; additionalStaff?: number; additionalServices?: number }) =>
      request<{ message: string; limits: { members: number; staff: number; services: number }; additionalMembers: number; additionalStaff: number; additionalServices: number }>(
        `/subscription/branch/${branchId}/limits`,
        {
          method: 'PUT',
          body: JSON.stringify(limits),
          headers: { 'X-Admin-Secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || 'fitark-admin-2025' },
        }
      ),
  },
};
