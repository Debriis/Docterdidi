'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/axios';
import { UserPlus, Users, Phone, Hash, Trash2, X, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  notes: string;
  created_at: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', age: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.patients);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/patients', { ...form, age: Number(form.age) });
      await fetchPatients();
      setShowModal(false);
      setForm({ name: '', age: '', phone: '', notes: '' });
      showToast('success', 'Patient added successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add patient';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your patients?`)) return;
    try {
      await api.delete(`/patients/${id}`);
      setPatients((p) => p.filter((pat) => pat.id !== id));
      showToast('success', `${name} removed`);
    } catch {
      showToast('error', 'Failed to delete patient');
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

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
              <Users size={32} color="#C46A3C" /> Patient Management
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1.125rem', marginTop: '8px' }}>{patients.length} patients registered</p>
          </div>
          <button id="add-patient-btn" className="btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={18} /> Add Patient
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input className="input-field" style={{ paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }} placeholder="Search by name or phone..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="premium-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#C46A3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              Loading patients...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center' }}>
              <Users size={56} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6B7280', fontWeight: 500, fontSize: '1.125rem' }}>{search ? 'No patients match your search' : 'No patients yet. Add your first patient!'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th><Hash size={14} style={{ display: 'inline', marginRight: '6px' }} />Name</th>
                    <th>Age</th>
                    <th><Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />Phone</th>
                    <th>Notes</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: '#F8F5F1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#C46A3C', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                          }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: '#111827', fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.age} yrs</td>
                      <td>{p.phone}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '—'}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Add New Patient</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Patient full name', required: true },
                { label: 'Age', name: 'age', type: 'number', placeholder: 'Patient age', required: true },
                { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 98765 43210', required: true },
              ].map(({ label, name, type, placeholder, required }) => (
                <div key={name}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>{label}</label>
                  <input
                    id={`patient-${name}`}
                    type={type} className="input-field" placeholder={placeholder} required={required}
                    value={form[name as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Notes (optional)</label>
                <input id="patient-notes" type="text" className="input-field" placeholder="Allergies, conditions, etc."
                  value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-patient-btn" type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Saving...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
