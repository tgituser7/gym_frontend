import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export const metadata: Metadata = {
  title: 'FlexMS - Gym Management System',
  description: 'Complete gym management solution for multi-branch gyms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
