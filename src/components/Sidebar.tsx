'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Dumbbell,
  DollarSign, Zap, GitBranch, LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Gym } from '@/types';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/staff', label: 'Staff', icon: UserCheck },
  { href: '/services', label: 'Services', icon: Dumbbell },
  { href: '/fees', label: 'Fees', icon: DollarSign },
  // { href: '/branches', label: 'Branches', icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { branch, logout } = useAuth();
  const gym = branch ? (branch.gym as Gym) : null;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-lg leading-tight truncate">{gym?.name || 'FlexMS'}</h1>
          <p className="text-slate-400 text-xs">Management System</p>
        </div>
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
  );
}
