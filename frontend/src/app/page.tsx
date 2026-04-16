'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Users, FileText, AlertTriangle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  totalPatients: number;
  activePrescriptions: number;
  missedDoses: number;
  takenDoses: number;
}

export default function DashboardPage() {
  const { doctor } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalPatients: 0, activePrescriptions: 0, missedDoses: 0, takenDoses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, prescriptionsRes, monitoringRes] = await Promise.all([
          api.get('/patients'),
          api.get('/prescriptions'),
          api.get('/monitoring'),
        ]);
        setStats({
          totalPatients: patientsRes.data.patients.length,
          activePrescriptions: prescriptionsRes.data.prescriptions.filter((p: { isActive: boolean }) => p.isActive).length,
          missedDoses: monitoringRes.data.summary.missed,
          takenDoses: monitoringRes.data.summary.taken,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'indigo',
      iconColor: '#818cf8',
      bg: 'rgba(99,102,241,0.1)',
      desc: 'Registered under your care',
    },
    {
      label: 'Active Prescriptions',
      value: stats.activePrescriptions,
      icon: FileText,
      color: 'teal',
      iconColor: '#2dd4bf',
      bg: 'rgba(20,184,166,0.1)',
      desc: 'Currently active',
    },
    {
      label: 'Missed Doses',
      value: stats.missedDoses,
      icon: AlertTriangle,
      color: 'red',
      iconColor: '#f87171',
      bg: 'rgba(239,68,68,0.1)',
      desc: 'Requires attention',
    },
    {
      label: 'Doses Taken',
      value: stats.takenDoses,
      icon: CheckCircle2,
      color: 'amber',
      iconColor: '#fbbf24',
      bg: 'rgba(245,158,11,0.1)',
      desc: 'Successfully administered',
    },
  ];

  return (
    <DashboardLayout>
      <div className="fade-in">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pulse-dot" />
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Live Dashboard</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">Dr. {doctor?.name?.split(' ').slice(-1)[0]}</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          {statCards.map(({ label, value, icon: Icon, color, iconColor, bg, desc }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1, marginTop: '8px' }}>
                    {loading ? (
                      <div style={{ width: '60px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                    ) : value}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px' }}>{desc}</p>
                </div>
                <div style={{ width: '48px', height: '48px', background: bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={iconColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick info banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={22} color="#818cf8" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem', marginBottom: '4px' }}>Monitoring is running</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Patient medication statuses are automatically updated. Visit the Monitoring tab to see real-time details.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <Clock size={14} />
            Updated just now
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </DashboardLayout>
  );
}
