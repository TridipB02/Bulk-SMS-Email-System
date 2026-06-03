import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MessageSquare, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState('register'); // 'register' | 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/auth/register', form);
            toast.success('Registration successful! Check your email for OTP');
            setStep('otp');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/auth/verify-otp', { email: form.email, otp });
            toast.success('Account verified successfully!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px 12px 42px',
        border: '1.5px solid #e2e8f0', borderRadius: '10px',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', transition: 'border-color 0.2s'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
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
                    backgroundColor: 'white', borderRadius: '24px',
                    padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                }}>
                    {step === 'register' ? (
                        <>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                                Create account
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
                                Register to access the Bulk SMS system
                            </p>

                            <form onSubmit={handleRegister}>
                                {/* Name */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                        Full Name
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#2563eb'}
                                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

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
                                            style={inputStyle}
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
                                            required
                                            style={{ ...inputStyle, paddingRight: '44px' }}
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

                                    {/* Password strength indicator */}
                                    {form.password && (
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                            {[1, 2, 3, 4].map((level) => (
                                                <div key={level} style={{
                                                    flex: 1, height: '3px', borderRadius: '2px',
                                                    backgroundColor: form.password.length >= level * 2
                                                        ? level <= 1 ? '#ef4444'
                                                            : level <= 2 ? '#f59e0b'
                                                                : level <= 3 ? '#3b82f6'
                                                                    : '#22c55e'
                                                        : '#e2e8f0'
                                                }} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Register Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '13px',
                                        background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontSize: '15px', fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                                    }}
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </form>

                            <div style={{
                                textAlign: 'center', marginTop: '24px', paddingTop: '24px',
                                borderTop: '1px solid #f1f5f9', fontSize: '14px', color: '#64748b'
                            }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                                    Sign in
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* OTP Step */}
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <div style={{
                                    width: '72px', height: '72px', background: '#f0fdf4',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    <CheckCircle size={36} color="#22c55e" />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>
                                    Verify your email
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                                    We sent a 6-digit verification code to<br />
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
                                    {loading ? 'Verifying...' : 'Verify & Continue'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('register')}
                                    style={{
                                        width: '100%', padding: '13px', background: 'none',
                                        border: 'none', color: '#64748b', fontSize: '14px',
                                        cursor: 'pointer', fontFamily: 'inherit'
                                    }}
                                >
                                    ← Back to registration
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