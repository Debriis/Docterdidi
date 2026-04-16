import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Pill-Pal Doctor Dashboard',
  description: 'Smart prescription and patient monitoring dashboard for doctors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Background blobs */}
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
