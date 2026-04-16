'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/axios';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, Clock, Wifi } from 'lucide-react';

interface LogEntry {
  id: string;
  status: 'Taken' | 'Missed' | 'Pending';
  scheduled_date: string;
  taken_at: string | null;
  patients: { id: string; name: string; age: number; phone: string };
  prescriptions: { id: string; medicine_name: string; dosage: string; timing: string };
}

interface Summary { total: number; taken: number; missed: number; pending: number; }

const POLL_INTERVAL = 8000; // 8 seconds

export default function MonitoringPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, taken: 0, missed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchMonitoring = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/monitoring');
      setLogs(res.data.logs);
      setSummary(res.data.summary);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoring();
    if (!isPolling) return;
    const interval = setInterval(() => fetchMonitoring(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMonitoring, isPolling]);

  const updateStatus = async (logId: string, newStatus: string) => {
    setUpdating(logId);
    try {
      const res = await api.patch(`/monitoring/${logId}`, { status: newStatus });
      setLogs((prev) => prev.map((l) => (l.id === logId ? res.data.log : l)));
      setSummary((prev) => {
        const oldLog = logs.find((l) => l.id === logId);
        const updated = { ...prev };
        if (oldLog) {
          const oldKey = oldLog.status.toLowerCase() as keyof Summary;
          const newKey = newStatus.toLowerCase() as keyof Summary;
          updated[oldKey] = Math.max(0, updated[oldKey] - 1);
          updated[newKey] = updated[newKey] + 1;
        }
        return updated;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Taken': return { badge: 'badge-taken', icon: <CheckCircle2 size={13} />, label: 'Taken' };
      case 'Missed': return { badge: 'badge-missed', icon: <AlertTriangle size={13} />, label: 'Missed' };
      default: return { badge: 'badge-pending', icon: <Clock size={13} />, label: 'Pending' };
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
              <Activity size={32} color="#C46A3C" /> Medication Monitoring
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-dot" style={{ background: isPolling ? '#10b981' : '#9CA3AF' }} />
                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>{isPolling ? 'Live polling every 8s' : 'Polling paused'}</span>
              </div>
              {lastUpdated && (
                <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsPolling((p) => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                background: isPolling ? '#ECFDF5' : '#F3F4F6',
                border: `1px solid ${isPolling ? '#A7F3D0' : '#E5E7EB'}`,
                borderRadius: '8px', color: isPolling ? '#059669' : '#6B7280',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <Wifi size={16} />
              {isPolling ? 'Polling On' : 'Polling Off'}
            </button>
            <button id="refresh-monitoring-btn" className="btn-secondary" style={{ border: '1px solid #E5E7EB', background: '#FFFFFF' }} onClick={() => fetchMonitoring()}>
              <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Logs', val: summary.total, color: '#374151', bg: '#F9FAFB' },
            { label: 'Taken', val: summary.taken, color: '#059669', bg: '#ECFDF5' },
            { label: 'Missed', val: summary.missed, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Pending', val: summary.pending, color: '#D97706', bg: '#FFFBEB' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid #E5E7EB`, borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color, marginTop: '8px' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        <div className="premium-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ width: '44px', height: '44px', border: '3px solid #E5E7EB', borderTopColor: '#C46A3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              Loading medication logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <Activity size={56} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6B7280', fontWeight: 500, fontSize: '1.125rem' }}>No medication logs yet. Create prescriptions to start monitoring.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Timing</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const { badge, icon, label } = getStatusStyles(log.status);
                    return (
                      <tr key={log.id} style={{ animationDelay: `${i * 0.04}s` }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: '#F8F5F1',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#C46A3C', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                            }}>
                              {log.patients?.name?.charAt(0) || '?'}
                            </div>
                            <span style={{ color: '#111827', fontWeight: 600 }}>{log.patients?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#374151', fontWeight: 600 }}>{log.prescriptions?.medicine_name || '—'}</td>
                        <td style={{ color: '#4B5563' }}>{log.prescriptions?.dosage || '—'}</td>
                        <td style={{ textTransform: 'capitalize', color: '#4B5563' }}>{log.prescriptions?.timing || '—'}</td>
                        <td style={{ color: '#4B5563' }}>{new Date(log.scheduled_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                            {icon}{label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {log.status !== 'Taken' && (
                              <button
                                disabled={updating === log.id}
                                onClick={() => updateStatus(log.id, 'Taken')}
                                style={{ padding: '6px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', color: '#059669', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: updating === log.id ? 0.5 : 1, transition: 'all 0.2s ease' }}
                              >Taken</button>
                            )}
                            {log.status !== 'Missed' && (
                              <button
                                disabled={updating === log.id}
                                onClick={() => updateStatus(log.id, 'Missed')}
                                style={{ padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: updating === log.id ? 0.5 : 1, transition: 'all 0.2s ease' }}
                              >Missed</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
