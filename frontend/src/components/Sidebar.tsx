'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  LogOut,
  Pill,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/monitoring', label: 'Monitoring', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { doctor, logout } = useAuth();

  return (
    <aside
      style={{
        width: '260px',
        minHeight: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 20px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 32px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            background: '#C46A3C',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pill size={20} color="white" />
        </div>
        <div>
          <div className="font-serif" style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111827' }}>Pill-Pal</div>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.1em' }}>DOCTOR DASHBOARD</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: active ? 600 : 500,
                fontSize: '0.95rem',
                color: active ? '#C46A3C' : '#4B5563',
                background: active ? '#F8F5F1' : 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                  (e.currentTarget as HTMLElement).style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#4B5563';
                }
              }}
            >
              <Icon size={18} color={active ? '#C46A3C' : '#9CA3AF'} />
              {label}
              {active && <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#C46A3C' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Doctor profile + logout */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
          <div className="font-serif" style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{doctor?.name || 'Doctor'}</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>{doctor?.specialty || 'General Practitioner'}</div>
          <div style={{ fontSize: '0.75rem', color: '#C46A3C', marginTop: '4px' }}>{doctor?.email}</div>
        </div>
        <button
          onClick={logout}
          id="logout-btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#EF4444',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
        >
          <LogOut size={16} color="#EF4444" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
