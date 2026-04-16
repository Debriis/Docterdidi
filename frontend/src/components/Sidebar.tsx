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
        background: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid rgba(99, 102, 241, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 28px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pill size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>Pill-Pal</div>
          <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600, letterSpacing: '0.05em' }}>DOCTOR DASHBOARD</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.5)', marginBottom: '20px' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
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
                padding: '11px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: active ? 600 : 500,
                fontSize: '0.875rem',
                color: active ? '#f1f5f9' : '#94a3b8',
                background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                }
              }}
            >
              <Icon size={18} color={active ? '#818cf8' : 'currentColor'} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#6366f1' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Doctor profile + logout */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ height: '1px', background: 'rgba(51, 65, 85, 0.5)', marginBottom: '16px' }} />
        <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{doctor?.name || 'Doctor'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{doctor?.specialty || 'General Practitioner'}</div>
          <div style={{ fontSize: '0.7rem', color: '#6366f1', marginTop: '2px' }}>{doctor?.email}</div>
        </div>
        <button
          onClick={logout}
          id="logout-btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontWeight: 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
