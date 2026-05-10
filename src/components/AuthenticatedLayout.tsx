'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

const AUTH_ROUTES = ['/login', '/register'];

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const [redirecting, setRedirecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token && !isAuthPage) {
      setRedirecting(true);
      router.replace('/login');
    } else if (token && isAuthPage) {
      setRedirecting(true);
      router.replace('/');
    } else {
      setRedirecting(false);
    }
  }, [token, loading, isAuthPage, router]);

  // Close sidebar on route change (mobile nav)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading || redirecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="sm:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 text-white shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">Fitark</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
