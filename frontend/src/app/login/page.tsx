'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Pill, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#F8F5F1'
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
          <p style={{ color: '#6B7280', fontSize: '1rem', marginTop: '4px' }}>Doctor Dashboard</p>
        </div>

        {/* Card */}
        <div className="premium-card" style={{ padding: '40px 32px' }}>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>Welcome back</h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '28px' }}>Sign in to your account to continue</p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '14px 16px', marginBottom: '24px',
              color: '#DC2626', fontSize: '0.9rem',
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '42px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }}
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '42px', paddingRight: '44px', paddingTop: '12px', paddingBottom: '12px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', justifyContent: 'center', padding: '14px' }}>
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', color: '#6B7280', fontSize: '0.95rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#C46A3C', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
