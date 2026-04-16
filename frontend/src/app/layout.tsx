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
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
