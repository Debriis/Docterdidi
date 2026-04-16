'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/axios';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, Clock, Wifi } from 'lucide-react';

interface LogEntry {
  _id: string;
  status: 'Taken' | 'Missed' | 'Pending';
  scheduledDate: string;
  takenAt: string | null;
  patientId: { _id: string; name: string; age: number; phone: string };
  prescriptionId: { _id: string; medicineName: string; dosage: string; timing: string };
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
      setLogs((prev) => prev.map((l) => (l._id === logId ? res.data.log : l)));
      setSummary((prev) => {
        const oldLog = logs.find((l) => l._id === logId);
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
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={22} color="#818cf8" /> Medication Monitoring
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" style={{ background: isPolling ? '#10b981' : '#64748b' }} />
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{isPolling ? 'Live polling every 8s' : 'Polling paused'}</span>
              </div>
              {lastUpdated && (
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setIsPolling((p) => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
                background: isPolling ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                border: `1px solid ${isPolling ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
                borderRadius: '10px', color: isPolling ? '#10b981' : '#64748b',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <Wifi size={14} />
              {isPolling ? 'Polling On' : 'Polling Off'}
            </button>
            <button id="refresh-monitoring-btn" className="btn-secondary" onClick={() => fetchMonitoring()}>
              <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Logs', val: summary.total, color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
            { label: 'Taken', val: summary.taken, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Missed', val: summary.missed, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Pending', val: summary.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, marginTop: '4px' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading medication logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Activity size={48} color="#334155" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748b', fontWeight: 500 }}>No medication logs yet. Create prescriptions to start monitoring.</p>
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
                      <tr key={log._id} style={{ animationDelay: `${i * 0.03}s` }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              background: `linear-gradient(135deg, hsl(${(i * 53) % 360},65%,38%), hsl(${(i * 53 + 40) % 360},65%,28%))`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                            }}>
                              {log.patientId?.name?.charAt(0) || '?'}
                            </div>
                            <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{log.patientId?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{log.prescriptionId?.medicineName || '—'}</td>
                        <td>{log.prescriptionId?.dosage || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{log.prescriptionId?.timing || '—'}</td>
                        <td>{new Date(log.scheduledDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {icon}{label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {log.status !== 'Taken' && (
                              <button
                                disabled={updating === log._id}
                                onClick={() => updateStatus(log._id, 'Taken')}
                                style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', opacity: updating === log._id ? 0.5 : 1, transition: 'all 0.2s ease' }}
                              >Taken</button>
                            )}
                            {log.status !== 'Missed' && (
                              <button
                                disabled={updating === log._id}
                                onClick={() => updateStatus(log._id, 'Missed')}
                                style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', opacity: updating === log._id ? 0.5 : 1, transition: 'all 0.2s ease' }}
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
