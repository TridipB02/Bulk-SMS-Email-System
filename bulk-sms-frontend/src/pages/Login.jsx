import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MessageSquare, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', form);
            const { token, refreshToken, email, role } = res.data;
            login(token, refreshToken, { email, role });
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!form.email) { toast.error('Enter your email first'); return; }
        setLoading(true);
        try {
            await api.post('/api/auth/send-otp', { email: form.email });
            toast.success('OTP sent to ' + form.email);
            setStep('otp');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/verify-otp', { email: form.email, otp });
            const { token, refreshToken, email, role } = res.data;
            login(token, refreshToken, { email, role });
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '72px', height: '72px', backgroundColor: 'white',
                        borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        marginBottom: '16px'
                    }}>
                        <MessageSquare size={36} color="#2563eb" />
                    </div>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '800', margin: '0' }}>
                        Bulk SMS System
                    </h1>
                    <p style={{ color: '#bfdbfe', fontSize: '14px', marginTop: '6px' }}>
                        NIC — Government of India
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                }}>
                    {step === 'login' ? (
                        <>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                                Welcome back
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
                                Sign in to your account to continue
                            </p>

                            <form onSubmit={handleLogin}>
                                {/* Email */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: '100%', padding: '12px 14px 12px 42px',
                                                border: '1.5px solid #e2e8f0', borderRadius: '10px',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                                transition: 'border-color 0.2s',
                                                fontFamily: 'inherit'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: '28px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            style={{
                                                width: '100%', padding: '12px 44px 12px 42px',
                                                border: '1.5px solid #e2e8f0', borderRadius: '10px',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                                fontFamily: 'inherit'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Sign In Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '13px',
                                        background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                                        marginBottom: '12px', fontFamily: 'inherit',
                                        boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                                    }}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>

                                {/* OTP Button */}
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '13px',
                                        background: 'white', color: '#2563eb',
                                        border: '1.5px solid #2563eb', borderRadius: '10px',
                                        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    Login with OTP
                                </button>
                            </form>

                            <div style={{
                                textAlign: 'center', marginTop: '24px', paddingTop: '24px',
                                borderTop: '1px solid #f1f5f9', fontSize: '14px', color: '#64748b'
                            }}>
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                                    Register here
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <div style={{
                                    width: '64px', height: '64px', background: '#eff6ff',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    <Mail size={28} color="#2563eb" />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
                                    Check your email
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>
                                    We sent a 6-digit code to<br />
                                    <strong style={{ color: '#1e293b' }}>{form.email}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    style={{
                                        width: '100%', padding: '16px',
                                        border: '1.5px solid #e2e8f0', borderRadius: '10px',
                                        fontSize: '28px', fontWeight: '700', textAlign: 'center',
                                        letterSpacing: '12px', outline: 'none', boxSizing: 'border-box',
                                        marginBottom: '20px', fontFamily: 'inherit'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '13px',
                                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                        marginBottom: '12px', fontFamily: 'inherit',
                                        boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                                    }}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('login')}
                                    style={{
                                        width: '100%', padding: '13px', background: 'none',
                                        border: 'none', color: '#64748b', fontSize: '14px',
                                        cursor: 'pointer', fontFamily: 'inherit'
                                    }}
                                >
                                    ← Back to login
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p style={{ textAlign: 'center', color: '#bfdbfe', fontSize: '12px', marginTop: '24px' }}>
                    © 2026 National Informatics Centre. All rights reserved.
                </p>
            </div>
        </div>
    );
}