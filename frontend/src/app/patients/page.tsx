'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/axios';
import { UserPlus, Users, Phone, Hash, Trash2, X, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Patient {
  _id: string;
  name: string;
  age: number;
  phone: string;
  notes: string;
  createdAt: string;
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
      setPatients((p) => p.filter((pat) => pat._id !== id));
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
              <Users size={22} color="#818cf8" /> Patient Management
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>{patients.length} patients registered</p>
          </div>
          <button id="add-patient-btn" className="btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Add Patient
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input-field" style={{ paddingLeft: '38px' }} placeholder="Search by name or phone..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading patients...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Users size={48} color="#334155" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748b', fontWeight: 500 }}>{search ? 'No patients match your search' : 'No patients yet. Add your first patient!'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th><Hash size={12} style={{ display: 'inline', marginRight: '4px' }} />Name</th>
                    <th>Age</th>
                    <th><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />Phone</th>
                    <th>Notes</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id} style={{ animationDelay: `${i * 0.04}s` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 70%, 40%), hsl(${(i * 47 + 40) % 360}, 70%, 30%))`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                          }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.age} yrs</td>
                      <td>{p.phone}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '—'}</td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(p._id, p.name)}>
                          <Trash2 size={12} /> Remove
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>Add New Patient</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Patient full name', required: true },
                { label: 'Age', name: 'age', type: 'number', placeholder: 'Patient age', required: true },
                { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 98765 43210', required: true },
              ].map(({ label, name, type, placeholder, required }) => (
                <div key={name}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{label}</label>
                  <input
                    id={`patient-${name}`}
                    type={type} className="input-field" placeholder={placeholder} required={required}
                    value={form[name as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Notes (optional)</label>
                <input id="patient-notes" type="text" className="input-field" placeholder="Allergies, conditions, etc."
                  value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
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
