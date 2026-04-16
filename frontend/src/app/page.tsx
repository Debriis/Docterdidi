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
          activePrescriptions: prescriptionsRes.data.prescriptions.filter((p: { is_active: boolean }) => p.is_active).length,
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
    },
    {
      label: 'Active Prescriptions',
      value: stats.activePrescriptions,
      icon: FileText,
    },
    {
      label: 'Missed Doses',
      value: stats.missedDoses,
      icon: AlertTriangle,
    },
    {
      label: 'Doses Taken',
      value: stats.takenDoses,
      icon: CheckCircle2,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 fade-in">
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="pulse-dot" />
            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 500 }}>Live System Active</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Welcome back, <br />
            <span style={{ color: '#C46A3C' }}>Dr. {doctor?.name?.split(' ').slice(-1)[0]}</span>
          </h1>
          <p style={{ color: '#6B7280', marginTop: '12px', fontSize: '1.125rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="premium-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>{label}</p>
                  <div className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', marginTop: '8px' }}>
                    {loading ? (
                      <div style={{ width: '60px', height: '36px', background: '#E5E7EB', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                    ) : value}
                  </div>
                </div>
                <div style={{ width: '48px', height: '48px', background: '#F8F5F1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color="#C46A3C" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick info banner */}
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '48px', height: '48px', background: '#F8F5F1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={22} color="#C46A3C" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="font-serif" style={{ fontWeight: 600, color: '#111827', fontSize: '1.25rem', marginBottom: '4px' }}>Monitoring is running</div>
            <div style={{ color: '#6B7280', fontSize: '0.95rem' }}>Patient medication statuses are automatically updated. Visit the Monitoring tab to see real-time details.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '0.875rem' }}>
            <Clock size={16} />
            Updated just now
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </DashboardLayout>
  );
}
