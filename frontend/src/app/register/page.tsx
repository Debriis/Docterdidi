'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Pill, Mail, Lock, User, Stethoscope, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', specialty: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.specialty);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}>
            <Pill size={30} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Pill-Pal</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>Create your doctor account</p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px', color: '#f1f5f9' }}>Get started</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>Fill in your details to create an account</p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              color: '#ef4444', fontSize: '0.85rem',
            }}>
              <AlertCircle size={16} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input id="reg-name" name="name" type="text" className="input-field" style={{ paddingLeft: '38px' }}
                  placeholder="Dr. John Smith" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input id="reg-email" name="email" type="email" className="input-field" style={{ paddingLeft: '38px' }}
                  placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Specialty</label>
              <div style={{ position: 'relative' }}>
                <Stethoscope size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 1 }} />
                <select id="reg-specialty" name="specialty" className="input-field" style={{ paddingLeft: '38px', appearance: 'none' }} value={form.specialty} onChange={handleChange}>
                  <option value="">Select specialty</option>
                  <option>General Practitioner</option>
                  <option>Cardiologist</option>
                  <option>Neurologist</option>
                  <option>Pediatrician</option>
                  <option>Orthopedist</option>
                  <option>Dermatologist</option>
                  <option>Psychiatrist</option>
                  <option>Oncologist</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'} className="input-field"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '4px', justifyContent: 'center', padding: '12px' }}>
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
