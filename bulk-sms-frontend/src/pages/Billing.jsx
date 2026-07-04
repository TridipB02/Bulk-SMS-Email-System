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
                    width: '44px', height: '44px', border: '3px solid #e2e7f7',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#64748b', margin: '0', fontWeight: '600' }}>Loading billing data...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const totalCredits = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalDebits  = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);

    return (
        <div style={{ maxWidth: '900px' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
                    Billing &amp; Credits
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                    Manage your credit balance and view transaction history
                </p>
            </div>

            {/* Top 3 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>

                {/* Balance */}
                <div style={{
                    background: '#f7d36b',
                    borderRadius: '18px', padding: '24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', position: 'relative' }}>
                        <CreditCard size={16} color="#704800" />
                        <p style={{ color: '#704800', fontSize: '11px', fontWeight: '800', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Current Balance
                        </p>
                    </div>
                    <p style={{ color: '#1e293b', fontSize: '44px', fontWeight: '900', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-2px', position: 'relative' }}>
                        {balance?.credits ?? 0}
                    </p>
                    <p style={{ color: '#8a5d0a', fontSize: '13px', margin: '0 0 18px', fontWeight: '700', position: 'relative' }}>
                        credits available
                    </p>
                    {balance?.credits <= 10 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#f7b8c4', borderRadius: '8px',
                            padding: '8px 12px', marginBottom: '16px', position: 'relative',
                        }}>
                            <AlertTriangle size={13} color="#a31f3c" />
                            <p style={{ color: '#a31f3c', fontSize: '12px', margin: '0', fontWeight: '700' }}>
                                Low balance — please top up
                            </p>
                        </div>
                    )}
                    <button onClick={() => setShowTopUp(true)} style={{
                        width: '100%', padding: '11px',
                        background: '#8a5d0a',
                        color: 'white', border: 'none',
                        borderRadius: '11px', fontSize: '13px', fontWeight: '800',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px', position: 'relative',
                    }}
                            onMouseEnter={e => e.currentTarget.style.background = '#704800'}
                            onMouseLeave={e => e.currentTarget.style.background = '#8a5d0a'}
                    >
                        <Plus size={15} /> Top Up Credits
                    </button>
                </div>

                {/* Total Topped Up */}
                <div style={{
                    background: '#93dba9',
                    borderRadius: '18px', padding: '24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', position: 'relative',
                    }}>
                        <TrendingUp size={21} color="#125a2c" />
                    </div>
                    <p style={{ color: '#0c3d1f', fontSize: '12px', fontWeight: '800', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px', position: 'relative' }}>
                        Total Topped Up
                    </p>
                    <p style={{ color: '#1e293b', fontSize: '34px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-1px', position: 'relative' }}>
                        {totalCredits}
                    </p>
                    <p style={{ color: '#125a2c', fontSize: '12px', margin: '0', fontWeight: '700', position: 'relative' }}>
                        credits added
                    </p>
                </div>

                {/* Total Used */}
                <div style={{
                    background: '#f193a6',
                    borderRadius: '18px', padding: '24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', position: 'relative',
                    }}>
                        <TrendingDown size={21} color="#7a1530" />
                    </div>
                    <p style={{ color: '#7a1530', fontSize: '12px', fontWeight: '800', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px', position: 'relative' }}>
                        Total Used
                    </p>
                    <p style={{ color: '#1e293b', fontSize: '34px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-1px', position: 'relative' }}>
                        {totalDebits}
                    </p>
                    <p style={{ color: '#7a1530', fontSize: '12px', margin: '0', fontWeight: '700', position: 'relative' }}>
                        credits spent
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div style={{
                background: 'white',
                borderRadius: '18px', overflow: 'hidden',
                border: '1px solid #eceefb',
            }}>
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #f4f6fd',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        background: '#fbe19a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Clock size={16} color="#8a5d0a" />
                    </div>
                    <div>
                        <h3 style={{ color: '#1e293b', fontWeight: '800', fontSize: '15px', margin: '0' }}>
                            Transaction History
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0', fontWeight: '600' }}>
                            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: '#fbe19a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                            <Clock size={28} color="#8a5d0a" />
                        </div>
                        <p style={{ color: '#1e293b', fontWeight: '700', margin: '0 0 4px' }}>No transactions yet</p>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0', fontWeight: '600' }}>Top up credits to see transactions here</p>
                    </div>
                ) : (
                    <div>
                        {transactions.map((tx, i) => (
                            <div key={tx.id} style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 24px',
                                borderBottom: i < transactions.length - 1 ? '1px solid #f4f6fd' : 'none',
                                transition: 'background 0.15s',
                            }}
                                 onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '11px',
                                        background: tx.type === 'CREDIT' ? '#d9f2e0' : '#fde3e8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {tx.type === 'CREDIT'
                                            ? <TrendingUp size={18} color="#1c6b3b" />
                                            : <TrendingDown size={18} color="#d44d6a" />
                                        }
                                    </div>
                                    <div>
                                        <p style={{ color: '#1e293b', fontWeight: '700', fontSize: '14px', margin: '0 0 3px' }}>
                                            {tx.description}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '12px', margin: '0', fontWeight: '600' }}>
                                            {new Date(tx.createdAt).toLocaleString('en-IN')}
                                            {tx.balanceAfter !== null && (
                                                <span style={{ color: '#94a3b8' }}>
                                                    {' '}• Balance after:{' '}
                                                    <span style={{ color: '#8a5d0a', fontWeight: '700' }}>{tx.balanceAfter}</span>
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{
                                        fontSize: '18px', fontWeight: '800', margin: '0 0 4px',
                                        color: tx.type === 'CREDIT' ? '#1c6b3b' : '#d44d6a',
                                        letterSpacing: '-0.5px',
                                    }}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount}
                                    </p>
                                    <span style={{
                                        padding: '3px 9px', borderRadius: '6px', fontSize: '10px',
                                        fontWeight: '800', textTransform: 'uppercase',
                                        background: tx.type === 'CREDIT' ? '#d9f2e0' : '#fde3e8',
                                        color: tx.type === 'CREDIT' ? '#1c6b3b' : '#d44d6a',
                                    }}>
                                        {tx.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Up Modal */}
            {showTopUp && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(30,41,59,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px',
                }}>
                    <div style={{
                        background: '#fffbeb',
                        borderRadius: '22px', padding: '32px',
                        width: '100%', maxWidth: '420px',
                        boxShadow: '0 30px 70px rgba(30,41,59,0.25)',
                    }}>
                        <div style={{ height: '4px', borderRadius: '2px', background: '#f7d36b', marginBottom: '24px' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ color: '#1e293b', fontWeight: '800', fontSize: '20px', margin: '0 0 4px' }}>
                                    Top Up Credits
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0', fontWeight: '600' }}>
                                    Current balance: <strong style={{ color: '#8a5d0a' }}>{balance?.credits}</strong> credits
                                </p>
                            </div>
                            <button onClick={() => { setShowTopUp(false); setTopUpAmount(''); }} style={{
                                background: '#fbe19a', border: 'none',
                                cursor: 'pointer', width: '34px', height: '34px', borderRadius: '9px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a5d0a',
                            }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Quick amounts */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '800', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Quick Select
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {[50, 100, 200, 500].map(amt => {
                                    const active = topUpAmount === String(amt);
                                    return (
                                        <button key={amt} onClick={() => setTopUpAmount(String(amt))} style={{
                                            padding: '11px', borderRadius: '10px', fontSize: '15px',
                                            fontWeight: '800', cursor: 'pointer',
                                            background: active ? '#8a5d0a' : 'white',
                                            border: 'none',
                                            color: active ? 'white' : '#475569',
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
                                <label style={{ display: 'block', color: '#64748b', fontSize: '12px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Custom Amount
                                </label>
                                <input
                                    type="number" min="1" placeholder="Enter amount"
                                    value={topUpAmount}
                                    onChange={e => setTopUpAmount(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '10px', fontSize: '16px',
                                        color: '#1e293b', outline: 'none',
                                        fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: '800',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => { setShowTopUp(false); setTopUpAmount(''); }} style={{
                                    flex: 1, padding: '12px',
                                    background: 'white', border: 'none',
                                    color: '#475569', borderRadius: '10px',
                                    fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={{
                                    flex: 1, padding: '12px',
                                    background: '#8a5d0a',
                                    border: 'none', color: 'white', borderRadius: '10px',
                                    fontSize: '14px', fontWeight: '800', cursor: 'pointer',
                                    opacity: submitting ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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