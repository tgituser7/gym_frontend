import Link from 'next/link';
import { Zap } from 'lucide-react';
import PrivacyContent from '@/components/legal/PrivacyContent';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Fitark</span>
        </div>

        <div className="card space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mt-1">Last updated: May 2025</p>
          </div>

          <PrivacyContent />

          <div className="pt-2">
            <Link href="/register" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              ← Back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
