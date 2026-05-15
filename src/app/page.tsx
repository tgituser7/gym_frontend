import Link from 'next/link';
import { Users, Dumbbell, UserCheck, TrendingUp, Bell, LayoutDashboard, Mail } from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard & Stats',
    desc: 'Get a real-time overview of your gym — active members, monthly revenue, pending dues, and upcoming renewals at a glance.',
  },
  {
    icon: Users,
    label: 'Member Management',
    desc: 'Add and manage members with their contact info, enrolled services, membership dates, and active/inactive status. Search and filter in seconds.',
  },
  {
    icon: Dumbbell,
    label: 'Services & Classes',
    desc: 'Create and manage gym services or classes with pricing, duration, schedule, capacity, and assigned instructor. Keep everything organised.',
  },
  {
    icon: UserCheck,
    label: 'Staff Management',
    desc: 'Manage your entire team — trainers, instructors, receptionists, and more. Track roles, specializations, salary, and join dates.',
  },
  {
    icon: TrendingUp,
    label: 'Fee Tracking',
    desc: 'Record and monitor member fees. Track settled, due, and overdue payments. See monthly revenue and outstanding amounts instantly.',
  },
  {
    icon: Bell,
    label: 'Renewal Reminders',
    desc: 'Never miss a membership renewal. View members whose memberships are expiring in 3, 7, 14, or 30 days and act before they lapse.',
  },
];

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="8.5" width="4" height="7" rx="1.5"/>
              <rect x="5" y="10.5" width="2.5" height="3" rx="0.75"/>
              <rect x="7.5" y="11" width="9" height="2" rx="0.75"/>
              <rect x="16.5" y="10.5" width="2.5" height="3" rx="0.75"/>
              <rect x="19" y="8.5" width="4" height="7" rx="1.5"/>
            </svg>
          </div>
          <span className="font-bold text-xl">Fitark</span>
        </div>
        <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Sign In
        </Link>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Gym Management Made Simple
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 max-w-2xl">
            Run your gym<br />
            <span className="text-orange-500">smarter, not harder</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl">
            Fitark is an all-in-one gym management platform — members, staff, services, fees, and renewals, all in one simple dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors text-sm"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Everything you need to manage your gym</h2>
          <p className="text-gray-500 text-sm text-center mb-10">All features included. No complexity.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <p className="font-semibold text-gray-900 mb-2">{label}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing note */}
        <section className="px-6 pb-16">
          <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-2xl px-8 py-10 text-center">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Subscription</p>
            <p className="text-3xl font-extrabold mb-1">
              Starts at <span className="text-orange-400">₹600</span>
              <span className="text-lg font-normal text-slate-300">/month</span>
            </p>
            <p className="text-slate-400 text-sm mt-3 mb-6">
              For more details and requirements, or to get started,<br className="hidden sm:block" /> reach out to us directly.
            </p>
            <a
              href="mailto:hello.flexms@gmail.com"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Mail className="w-4 h-4" /> hello.flexms@gmail.com
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Fitark. All rights reserved.
      </footer>
    </div>
  );
}
