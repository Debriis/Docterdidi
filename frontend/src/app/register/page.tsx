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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#F8F5F1' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: '#C46A3C',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 25px -5px rgba(196,106,60,0.4)',
          }}>
            <Pill size={32} color="white" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Pill-Pal</h1>
          <p style={{ color: '#6B7280', fontSize: '1rem', marginTop: '4px' }}>Create your doctor account</p>
        </div>

        <div className="premium-card" style={{ padding: '40px 32px' }}>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>Get started</h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '28px' }}>Fill in your details to create an account</p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '14px 16px', marginBottom: '24px',
              color: '#DC2626', fontSize: '0.9rem',
            }}>
              <AlertCircle size={18} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input id="reg-name" name="name" type="text" className="input-field" style={{ paddingLeft: '42px', paddingTop: '12px', paddingBottom: '12px' }}
                  placeholder="Dr. John Smith" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input id="reg-email" name="email" type="email" className="input-field" style={{ paddingLeft: '42px', paddingTop: '12px', paddingBottom: '12px' }}
                  placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Specialty</label>
              <div style={{ position: 'relative' }}>
                <Stethoscope size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
                <select id="reg-specialty" name="specialty" className="input-field" style={{ paddingLeft: '42px', appearance: 'none', paddingTop: '12px', paddingBottom: '12px' }} value={form.specialty} onChange={handleChange}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'} className="input-field"
                  style={{ paddingLeft: '42px', paddingRight: '44px', paddingTop: '12px', paddingBottom: '12px' }}
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', justifyContent: 'center', padding: '14px' }}>
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', color: '#6B7280', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#C46A3C', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
