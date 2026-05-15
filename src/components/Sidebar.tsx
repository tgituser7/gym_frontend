'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Dumbbell,
  DollarSign, LogOut, X, Bell, CreditCard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Gym } from '@/types';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/staff', label: 'Staff', icon: UserCheck },
  { href: '/services', label: 'Services', icon: Dumbbell },
  { href: '/fees', label: 'Fees', icon: DollarSign },
  { href: '/renewals', label: 'Renewals', icon: Bell },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  // { href: '/branches', label: 'Branches', icon: GitBranch },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const { branch, logout } = useAuth();
  const gym = branch ? (branch.gym as Gym) : null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          sm:relative sm:translate-x-0 sm:z-auto sm:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="8.5" width="4" height="7" rx="1.5"/>
                <rect x="5" y="10.5" width="2.5" height="3" rx="0.75"/>
                <rect x="7.5" y="11" width="9" height="2" rx="0.75"/>
                <rect x="16.5" y="10.5" width="2.5" height="3" rx="0.75"/>
                <rect x="19" y="8.5" width="4" height="7" rx="1.5"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight truncate">{gym?.name || 'Fitark'}</h1>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sm:hidden p-1 text-slate-400 hover:text-white rounded-lg shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-3 border-b border-slate-700">
          <p className="text-slate-500 text-xs px-2 mb-1.5 font-medium uppercase tracking-wide">Current Branch</p>
          <div className="px-3 py-2 bg-slate-800 rounded-lg">
            <p className="text-slate-200 text-sm font-medium truncate">{branch?.name || '—'}</p>
            {branch?.status === 'inactive' && (
              <p className="text-xs text-amber-400 mt-0.5">Inactive</p>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-slate-700 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs text-slate-400 truncate">{branch?.email || gym?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
