import { Member, Staff, Service, Fee, Branch, DashboardStats } from '@/types';

// const BASE_URL = "https://facechatappbackend.onrender.com/api" || 'http://localhost:5000/api';
const BASE_URL = "https://facechatappbackend.onrender.com/api"

let _token: string | null = null;

export function setApiToken(token: string | null): void {
  _token = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
    ...options,
  });
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
    get: (id: string) => request<Member>(`/members/${id}`),
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
    get: (id: string) => request<Fee>(`/fees/${id}`),
    create: (data: Partial<Fee>) =>
      request<Fee>('/fees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Fee>) =>
      request<Fee>(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/fees/${id}`, { method: 'DELETE' }),
  },
};
