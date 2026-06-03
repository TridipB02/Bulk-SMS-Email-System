import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    CreditCard, TrendingUp, TrendingDown,
    Plus, Clock, AlertTriangle, X
} from 'lucide-react';

export default function Billing() {
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [balanceRes, txRes] = await Promise.all([
                api.get('/api/billing/balance'),
                api.get('/api/billing/transactions')
            ]);
            setBalance(balanceRes.data);
            setTransactions(txRes.data);
        } catch {
            toast.error('Failed to load billing data');
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async (e) => {
        e.preventDefault();
        if (!topUpAmount || topUpAmount <= 0) { toast.error('Enter a valid amount'); return; }
        setSubmitting(true);
        try {
            await api.post('/api/billing/topup', {
                userId: balance.userId,
                amount: parseInt(topUpAmount),
                description: 'Manual top-up'
            });
            toast.success(`${topUpAmount} credits added!`);
            setShowTopUp(false);
            setTopUpAmount('');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Top up failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#d97706', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#94a3b8', margin: '0', fontWeight: '500' }}>Loading billing data...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const totalCredits = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalDebits  = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);

    return (
        <div style={{ maxWidth: '900px' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
                    Billing &amp; Credits
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0', fontWeight: '500' }}>
                    Manage your credit balance and view transaction history
                </p>
            </div>

            {/* Top 3 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>

                {/* ── Yellow Credit Balance Card ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #78350f, #b45309, #d97706)',
                    borderRadius: '18px', padding: '24px',
                    boxShadow: '0 8px 28px rgba(217,119,6,0.3)',
                    position: 'relative', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: '#fcd34d', opacity: 0.12 }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <CreditCard size={16} color="#fcd34d" />
                        <p style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '700', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Current Balance
                        </p>
                    </div>
                    <p style={{ color: 'white', fontSize: '44px', fontWeight: '900', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-2px' }}>
                        {balance?.credits ?? 0}
                    </p>
                    <p style={{ color: '#fde68a', fontSize: '13px', margin: '0 0 18px', fontWeight: '500' }}>
                        credits available
                    </p>

                    {balance?.credits <= 10 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(239,68,68,0.25)', borderRadius: '8px',
                            padding: '8px 12px', marginBottom: '16px',
                            border: '1px solid rgba(239,68,68,0.3)',
                        }}>
                            <AlertTriangle size={13} color="#fca5a5" />
                            <p style={{ color: '#fca5a5', fontSize: '12px', margin: '0', fontWeight: '600' }}>
                                Low balance — please top up
                            </p>
                        </div>
                    )}

                    <button onClick={() => setShowTopUp(true)} style={{
                        width: '100%', padding: '11px',
                        background: 'rgba(255,255,255,0.15)',
                        color: 'white', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '11px', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                    }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <Plus size={15} /> Top Up Credits
                    </button>
                </div>

                {/* ── Total Topped Up ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #064e3b, #059669)',
                    borderRadius: '18px', padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 20px rgba(5,150,105,0.25)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: '#6ee7b7', opacity: 0.12 }} />
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    }}>
                        <TrendingUp size={21} color="white" />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Topped Up
                    </p>
                    <p style={{ color: 'white', fontSize: '34px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-1px' }}>
                        {totalCredits}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0', fontWeight: '500' }}>
                        credits added
                    </p>
                </div>

                {/* ── Total Used ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                    borderRadius: '18px', padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 20px rgba(220,38,38,0.25)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: '#fca5a5', opacity: 0.12 }} />
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    }}>
                        <TrendingDown size={21} color="white" />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Used
                    </p>
                    <p style={{ color: 'white', fontSize: '34px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-1px' }}>
                        {totalDebits}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0', fontWeight: '500' }}>
                        credits spent
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div style={{
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '18px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}>
                {/* Panel header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        background: 'linear-gradient(135deg,#78350f,#d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Clock size={16} color="white" />
                    </div>
                    <div>
                        <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px', margin: '0' }}>
                            Transaction History
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 0', fontWeight: '500' }}>
                            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'rgba(217,119,6,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                            <Clock size={28} color="#d97706" />
                        </div>
                        <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0 0 4px' }}>No transactions yet</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0' }}>Top up credits to see transactions here</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 8px' }}>
                        {transactions.map((tx, i) => (
                            <div key={tx.id} style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 16px',
                                borderBottom: i < transactions.length - 1
                                    ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                transition: 'background 0.15s',
                            }}
                                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '11px',
                                        background: tx.type === 'CREDIT'
                                            ? 'rgba(5,150,105,0.18)' : 'rgba(220,38,38,0.18)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {tx.type === 'CREDIT'
                                            ? <TrendingUp size={18} color="#6ee7b7" />
                                            : <TrendingDown size={18} color="#fca5a5" />
                                        }
                                    </div>
                                    <div>
                                        <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px', margin: '0 0 3px' }}>
                                            {tx.description}
                                        </p>
                                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0', fontWeight: '500' }}>
                                            {new Date(tx.createdAt).toLocaleString('en-IN')}
                                            {tx.balanceAfter !== null && (
                                                <span style={{ color: '#475569' }}>
                                                    {' '}• Balance after: <span style={{ color: '#fcd34d', fontWeight: '600' }}>{tx.balanceAfter}</span>
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{
                                        fontSize: '18px', fontWeight: '800', margin: '0 0 4px',
                                        color: tx.type === 'CREDIT' ? '#6ee7b7' : '#fca5a5',
                                        letterSpacing: '-0.5px',
                                    }}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount}
                                    </p>
                                    <span style={{
                                        padding: '3px 9px', borderRadius: '6px', fontSize: '10px',
                                        fontWeight: '700', textTransform: 'uppercase',
                                        background: tx.type === 'CREDIT'
                                            ? 'rgba(5,150,105,0.18)' : 'rgba(220,38,38,0.18)',
                                        color: tx.type === 'CREDIT' ? '#6ee7b7' : '#fca5a5',
                                    }}>
                                        {tx.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Top Up Modal ── */}
            {showTopUp && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px',
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg,#0f172a,#1a2744)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '22px', padding: '32px',
                        width: '100%', maxWidth: '420px',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
                    }}>
                        {/* Accent bar — yellow */}
                        <div style={{ height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg,#d97706,#fcd34d)', marginBottom: '24px' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px', margin: '0 0 4px' }}>
                                    Top Up Credits
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0', fontWeight: '500' }}>
                                    Current balance: <strong style={{ color: '#fcd34d' }}>{balance?.credits}</strong> credits
                                </p>
                            </div>
                            <button onClick={() => { setShowTopUp(false); setTopUpAmount(''); }} style={{
                                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', width: '34px', height: '34px', borderRadius: '9px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
                            }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Quick amounts */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Quick Select
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {[50, 100, 200, 500].map(amt => {
                                    const active = topUpAmount === String(amt);
                                    return (
                                        <button key={amt} onClick={() => setTopUpAmount(String(amt))} style={{
                                            padding: '11px', borderRadius: '10px', fontSize: '15px',
                                            fontWeight: '700', cursor: 'pointer',
                                            background: active ? 'linear-gradient(135deg,#78350f,#d97706)' : 'rgba(255,255,255,0.07)',
                                            border: active ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.1)',
                                            color: active ? 'white' : '#94a3b8',
                                            boxShadow: active ? '0 4px 12px rgba(217,119,6,0.3)' : 'none',
                                            transition: 'all 0.15s',
                                        }}>
                                            {amt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleTopUp}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#64748b', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Custom Amount
                                </label>
                                <input
                                    type="number" min="1" placeholder="Enter amount"
                                    value={topUpAmount}
                                    onChange={e => setTopUpAmount(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1.5px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px', fontSize: '16px',
                                        color: 'white', outline: 'none',
                                        fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: '700',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => { setShowTopUp(false); setTopUpAmount(''); }} style={{
                                    flex: 1, padding: '12px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', borderRadius: '10px',
                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={{
                                    flex: 1, padding: '12px',
                                    background: 'linear-gradient(135deg,#78350f,#d97706)',
                                    border: 'none', color: 'white', borderRadius: '10px',
                                    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    opacity: submitting ? 0.7 : 1,
                                }}>
                                    <Plus size={16} />
                                    {submitting ? 'Processing...' : `Add ${topUpAmount || 0} Credits`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}