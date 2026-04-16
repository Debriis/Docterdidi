'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/axios';
import { QRCodeCanvas } from 'qrcode.react';
import { FileText, Plus, X, Download, QrCode, AlertCircle, CheckCircle2, Pill, ChevronDown } from 'lucide-react';

interface Patient { _id: string; name: string; age: number; phone: string; }
interface Prescription {
  _id: string;
  medicineName: string;
  dosage: string;
  timing: string;
  customTiming: string;
  duration: string;
  instructions: string;
  isActive: boolean;
  createdAt: string;
  patientId: Patient;
}

const timingColors: Record<string, string> = {
  morning: '#f59e0b',
  afternoon: '#6366f1',
  night: '#8b5cf6',
  custom: '#14b8a6',
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState<Prescription | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    patientId: '', medicineName: '', dosage: '', timing: 'morning', customTiming: '', duration: '', instructions: '',
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      const [pRes, prRes] = await Promise.all([api.get('/patients'), api.get('/prescriptions')]);
      setPatients(pRes.data.patients);
      setPrescriptions(prRes.data.prescriptions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/prescriptions', form);
      await fetchData();
      setShowModal(false);
      setForm({ patientId: '', medicineName: '', dosage: '', timing: 'morning', customTiming: '', duration: '', instructions: '' });
      showToast('success', 'Prescription created successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create prescription';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.patch(`/prescriptions/${id}/deactivate`);
      setPrescriptions((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: false } : p)));
      showToast('success', 'Prescription deactivated');
    } catch {
      showToast('error', 'Failed to deactivate');
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${showQR?._id}.png`;
    a.click();
  };

  const getQRData = (p: Prescription) =>
    JSON.stringify({
      id: p._id,
      patient: p.patientId?.name,
      medicine: p.medicineName,
      dosage: p.dosage,
      timing: p.timing === 'custom' ? p.customTiming : p.timing,
      duration: p.duration,
      instructions: p.instructions,
      issuedAt: p.createdAt,
    });

  return (
    <DashboardLayout>
      <div className="fade-in">
        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            borderRadius: '12px', padding: '14px 18px',
            color: toast.type === 'success' ? '#10b981' : '#ef4444',
            backdropFilter: 'blur(12px)', animation: 'fadeInUp 0.3s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.msg}</span>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} color="#818cf8" /> Prescriptions
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>{prescriptions.filter(p => p.isActive).length} active prescriptions</p>
          </div>
          <button id="new-prescription-btn" className="btn-primary" onClick={() => setShowModal(true)} disabled={patients.length === 0}>
            <Plus size={16} /> New Prescription
          </button>
        </div>

        {patients.length === 0 && !loading && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', color: '#f59e0b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> Add patients first before creating prescriptions.
          </div>
        )}

        {/* Prescription Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Loading prescriptions...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <Pill size={48} color="#334155" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontWeight: 500 }}>No prescriptions yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {prescriptions.map((p, i) => (
              <div key={p._id} className="stat-card" style={{ animationDelay: `${i * 0.05}s`, borderColor: p.isActive ? 'rgba(99,102,241,0.2)' : 'rgba(51,65,85,0.3)' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={18} color="#818cf8" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{p.medicineName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.patientId?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  <span className={`badge ${p.isActive ? 'badge-active' : ''}`} style={!p.isActive ? { background: 'rgba(100,116,139,0.15)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' } : {}}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Dosage', val: p.dosage },
                    { label: 'Duration', val: p.duration },
                    { label: 'Timing', val: p.timing === 'custom' ? p.customTiming : p.timing },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '8px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: '0.82rem', color: timingColors[p.timing] || '#f1f5f9', fontWeight: 600, marginTop: '2px', textTransform: 'capitalize' }}>{val}</div>
                    </div>
                  ))}
                  {p.instructions && (
                    <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: '8px', padding: '8px 10px', gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructions</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{p.instructions}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button id={`qr-btn-${p._id}`} onClick={() => setShowQR(p)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; }}>
                    <QrCode size={14} /> QR Code
                  </button>
                  {p.isActive && (
                    <button onClick={() => handleDeactivate(p._id)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}>
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>Create New Prescription</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Select Patient *</label>
                <div style={{ position: 'relative' }}>
                  <select id="rx-patient" required className="input-field" style={{ appearance: 'none' }}
                    value={form.patientId} onChange={(e) => setForm((p) => ({ ...p, patientId: e.target.value }))}>
                    <option value="">Choose a patient...</option>
                    {patients.map((p) => <option key={p._id} value={p._id}>{p.name} (Age: {p.age})</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Medicine Name *</label>
                  <input id="rx-medicine" required className="input-field" placeholder="e.g. Metformin"
                    value={form.medicineName} onChange={(e) => setForm((p) => ({ ...p, medicineName: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Dosage *</label>
                  <input id="rx-dosage" required className="input-field" placeholder="e.g. 500mg"
                    value={form.dosage} onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Timing *</label>
                  <div style={{ position: 'relative' }}>
                    <select id="rx-timing" required className="input-field" style={{ appearance: 'none' }}
                      value={form.timing} onChange={(e) => setForm((p) => ({ ...p, timing: e.target.value }))}>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="custom">Custom</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Duration *</label>
                  <input id="rx-duration" required className="input-field" placeholder="e.g. 30 days"
                    value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
                </div>
              </div>

              {form.timing === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Custom Timing *</label>
                  <input id="rx-custom-timing" className="input-field" placeholder="e.g. Every 8 hours"
                    value={form.customTiming} onChange={(e) => setForm((p) => ({ ...p, customTiming: e.target.value }))} required={form.timing === 'custom'} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Instructions (optional)</label>
                <input id="rx-instructions" className="input-field" placeholder="e.g. Take after meals"
                  value={form.instructions} onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-rx-btn" type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Saving...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowQR(null)}>
          <div className="modal-box" style={{ textAlign: 'center', maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#818cf8" /> Prescription QR
              </h2>
              <button onClick={() => setShowQR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px', background: 'white', borderRadius: '16px', marginBottom: '16px' }}>
              <QRCodeCanvas value={getQRData(showQR)} size={200} level="M" />
            </div>

            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>
              <strong style={{ color: '#f1f5f9' }}>{showQR.medicineName}</strong> — {showQR.patientId?.name}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '20px' }}>
              Scan to view prescription details in JSON format
            </p>

            <button id="download-qr-btn" className="btn-primary" onClick={downloadQR} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              <Download size={15} /> Download QR Code
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
