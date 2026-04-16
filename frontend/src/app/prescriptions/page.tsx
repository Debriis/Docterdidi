'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/axios';
import { QRCodeCanvas } from 'qrcode.react';
import { FileText, Plus, X, Download, QrCode, AlertCircle, CheckCircle2, Pill, ChevronDown, UploadCloud } from 'lucide-react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Patient { id: string; name: string; age: number; phone: string; }
interface Prescription {
  id: string;
  medicine_name: string;
  dosage: string;
  timing: string;
  custom_timing: string;
  duration: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  patients: Patient;
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

  // ✅ ONE ref — attached to the printable area inside the QR modal
  const pdfRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    patient_id: '', medicine_name: '', dosage: '', timing: 'morning', custom_timing: '', duration: '', instructions: '',
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
      setForm({ patient_id: '', medicine_name: '', dosage: '', timing: 'morning', custom_timing: '', duration: '', instructions: '' });
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
      setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: false } : p)));
      showToast('success', 'Prescription deactivated');
    } catch {
      showToast('error', 'Failed to deactivate');
    }
  };

  // ✅ pdfRef wraps the QR + details block — html2canvas captures it perfectly
  const downloadPDF = async () => {
    if (!pdfRef.current || !showQR) return;

    const canvas = await html2canvas(pdfRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`prescription-${showQR.id}.pdf`);
  };

  // ✅ Typed, handles custom timing
  const getQRData = (p: Prescription): string => {
    return JSON.stringify({
      id: p.id,
      patient: p.patients?.name,
      medicine: p.medicine_name,
      dosage: p.dosage,
      timing: p.timing === 'custom' && p.custom_timing ? p.custom_timing : p.timing,
      duration: p.duration,
      instructions: p.instructions,
      issuedAt: p.created_at,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 fade-in">

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            background: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${toast.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            borderRadius: '12px', padding: '14px 18px',
            color: toast.type === 'success' ? '#059669' : '#DC2626',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.msg}</span>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
              <FileText size={32} color="#C46A3C" /> Prescriptions
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1.125rem', marginTop: '8px' }}>{prescriptions.filter(p => p.is_active).length} active prescriptions</p>
          </div>
          <button id="new-prescription-btn" className="btn-primary" onClick={() => setShowModal(true)} disabled={patients.length === 0}>
            <Plus size={18} /> New Prescription
          </button>
        </div>

        {patients.length === 0 && !loading && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', color: '#D97706', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> Add patients first before creating prescriptions.
          </div>
        )}

        {/* Prescription Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#C46A3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Loading prescriptions...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="premium-card" style={{ padding: '80px', textAlign: 'center' }}>
            <Pill size={56} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#6B7280', fontWeight: 500, fontSize: '1.125rem' }}>No prescriptions yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {prescriptions.map((p, i) => (
              <div key={p.id} className="premium-card" style={{ animationDelay: `${i * 0.04}s`, opacity: p.is_active ? 1 : 0.6, borderColor: p.is_active ? '#E5E7EB' : '#F3F4F6' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', background: '#F8F5F1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={20} color="#C46A3C" />
                    </div>
                    <div>
                      <div className="font-serif" style={{ fontWeight: 700, color: '#111827', fontSize: '1.125rem' }}>{p.medicine_name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '2px' }}>{p.patients?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  <span className={`badge ${p.is_active ? 'badge-taken' : ''}`} style={!p.is_active ? { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' } : {}}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'Dosage', val: p.dosage },
                    { label: 'Duration', val: p.duration },
                    { label: 'Timing', val: p.timing === 'custom' ? p.custom_timing : p.timing },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: '0.9rem', color: timingColors[p.timing] || '#111827', fontWeight: 500, marginTop: '2px', textTransform: 'capitalize' }}>{val}</div>
                    </div>
                  ))}
                  {p.instructions && (
                    <div style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '10px 12px', gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructions</div>
                      <div style={{ fontSize: '0.9rem', color: '#4B5563', marginTop: '2px' }}>{p.instructions}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button id={`qr-btn-${p.id}`} onClick={() => setShowQR(p)} className="btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#F3F4F6', color: '#111827', fontSize: '0.85rem', fontWeight: 500 }}
                  >
                    <QrCode size={16} /> QR Code
                  </button>
                  {p.is_active && (
                    <button onClick={() => handleDeactivate(p.id)} className="btn-danger"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '0.85rem' }}>
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
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>Create New Prescription</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Upload Box */}
              <div style={{
                border: '2px dashed #D1D5DB', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px 0', background: '#FFFFFF', marginBottom: '10px'
              }}>
                <UploadCloud size={48} color="#9CA3AF" style={{ marginBottom: '16px' }} />
                <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Drop prescription here</p>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '16px' }}>or click to upload existing paperwork to auto-fill</p>
                <button type="button" className="btn-secondary" style={{ border: '1px solid #E5E7EB', padding: '8px 16px', fontSize: '0.875rem' }}>Browse Files</button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Select Patient *</label>
                <div style={{ position: 'relative' }}>
                  <select id="rx-patient" required className="input-field" style={{ appearance: 'none' }}
                    value={form.patient_id} onChange={(e) => setForm((p) => ({ ...p, patient_id: e.target.value }))}>
                    <option value="">Choose a patient...</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Medicine Name *</label>
                  <input id="rx-medicine" required className="input-field" placeholder="e.g. Metformin"
                    value={form.medicine_name} onChange={(e) => setForm((p) => ({ ...p, medicine_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Dosage *</label>
                  <input id="rx-dosage" required className="input-field" placeholder="e.g. 500mg"
                    value={form.dosage} onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Timing *</label>
                  <div style={{ position: 'relative' }}>
                    <select id="rx-timing" required className="input-field" style={{ appearance: 'none' }}
                      value={form.timing} onChange={(e) => setForm((p) => ({ ...p, timing: e.target.value }))}>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="custom">Custom</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Duration *</label>
                  <input id="rx-duration" required className="input-field" placeholder="e.g. 30 days"
                    value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
                </div>
              </div>

              {form.timing === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Custom Timing *</label>
                  <input id="rx-custom-timing" className="input-field" placeholder="e.g. Every 8 hours"
                    value={form.custom_timing} onChange={(e) => setForm((p) => ({ ...p, custom_timing: e.target.value }))} required={form.timing === 'custom'} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Instructions (optional)</label>
                <input id="rx-instructions" className="input-field" placeholder="e.g. Take after meals"
                  value={form.instructions} onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', border: '1px solid #E5E7EB' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-rx-btn" type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Saving...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ QR Modal — pdfRef on printable area only, button outside so it won't appear in PDF */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '420px', padding: '32px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={24} color="#C46A3C" /> Prescription QR
              </h2>
              <button onClick={() => setShowQR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <X size={24} />
              </button>
            </div>

            {/* ✅ pdfRef here — only this block gets captured by html2canvas */}
            <div ref={pdfRef} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <QRCodeCanvas
                  value={getQRData(showQR)}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#111827' }}>
                <p style={{ marginBottom: '6px' }}><strong>Patient:</strong> {showQR.patients?.name}</p>
                <p style={{ marginBottom: '6px' }}><strong>Medicine:</strong> {showQR.medicine_name}</p>
                <p style={{ marginBottom: '6px' }}><strong>Dosage:</strong> {showQR.dosage}</p>
                <p style={{ marginBottom: '6px' }}><strong>Timing:</strong> {showQR.timing === 'custom' && showQR.custom_timing ? showQR.custom_timing : showQR.timing}</p>
                <p style={{ marginBottom: '6px' }}><strong>Duration:</strong> {showQR.duration}</p>
                {showQR.instructions && (
                  <p><strong>Instructions:</strong> {showQR.instructions}</p>
                )}
              </div>
            </div>

            {/* Download button — outside pdfRef so it won't show up in the PDF */}
            <button
              id="download-pdf-btn"
              className="btn-primary"
              onClick={downloadPDF}
              style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
            >
              <Download size={18} /> Download Full Prescription PDF
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
