import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    ShieldCheck, Megaphone, CheckCircle, XCircle,
    Clock, Users, CreditCard, Plus, Eye,
    TrendingUp, Send, AlertTriangle
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT:            { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8',  label: 'Draft' },
    PENDING_APPROVAL: { bg: 'rgba(234,179,8,0.15)',   color: '#fbbf24',  label: 'Pending' },
    APPROVED:         { bg: 'rgba(37,99,235,0.15)',   color: '#60a5fa',  label: 'Approved' },
    SCHEDULED:        { bg: 'rgba(14,165,233,0.15)',  color: '#38bdf8',  label: 'Scheduled' },
    SENT:             { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',  label: 'Sent' },
    FAILED:           { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  label: 'Failed' },
    REJECTED:         { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  label: 'Rejected' },
};

export default function AdminPanel() {
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('campaigns');
    const [topUpModal, setTopUpModal] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('PENDING_APPROVAL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, usersRes] = await Promise.all([
                api.get('/api/campaigns'),
                api.get('/api/users')
            ]);
            setCampaigns(campaignsRes.data);
            setUsers(usersRes.data);
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/api/campaigns/${id}/approve`);
            toast.success('Campaign approved and dispatched!');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Reject this campaign?')) return;
        try {
            await api.put(`/api/campaigns/${id}/reject`);
            toast.success('Campaign rejected');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        }
    };

    const handleTopUp = async (e) => {
        e.preventDefault();
        if (!topUpAmount || topUpAmount <= 0) {
            toast.error('Enter valid amount');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/api/billing/topup', {
                userId: topUpModal.id,
                amount: parseInt(topUpAmount),
                description: `Admin top-up for ${topUpModal.email}`
            });
            toast.success(`${topUpAmount} credits added for ${topUpModal.email}`);
            setTopUpModal(null);
            setTopUpAmount('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Top up failed');
        } finally {
            setSubmitting(false);
        }
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '24px',
    };

    const filteredCampaigns = filter === 'ALL'
        ? campaigns
        : campaigns.filter(c => c.status === filter);

    const pendingCount = campaigns.filter(c => c.status === 'PENDING_APPROVAL').length;
    const sentCount = campaigns.filter(c => c.status === 'SENT').length;
    const scheduledCount = campaigns.filter(c => c.status === 'SCHEDULED').length;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#475569', margin: '0' }}>Loading admin panel...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1100px' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
                    }}>
                        <ShieldCheck size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0' }}>
                            Admin Panel
                        </h1>
                        <p style={{ color: '#475569', fontSize: '13px', margin: '0' }}>
                            Manage campaigns, users and billing
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Campaigns', value: campaigns.length, color: '#60a5fa', bg: 'rgba(37,99,235,0.15)', icon: Megaphone },
                    { label: 'Pending Approval', value: pendingCount, color: '#fbbf24', bg: 'rgba(234,179,8,0.15)', icon: Clock },
                    { label: 'Sent', value: sentCount, color: '#4ade80', bg: 'rgba(34,197,94,0.15)', icon: Send },
                    { label: 'Total Users', value: users.length, color: '#c084fc', bg: 'rgba(124,58,237,0.15)', icon: Users },
                ].map(s => (
                    <div key={s.label} style={{ ...cardStyle, padding: '18px 20px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '9px',
                            background: s.bg, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
                        }}>
                            <s.icon size={18} color={s.color} />
                        </div>
                        <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {s.label}
                        </p>
                        <p style={{ color: s.color, fontSize: '26px', fontWeight: '800', margin: '0' }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: '8px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '6px', width: 'fit-content'
            }}>
                {[
                    { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
                    { key: 'users', label: 'Users', icon: Users },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '9px 20px', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer', border: 'none',
                            background: activeTab === tab.key
                                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                : 'transparent',
                            color: activeTab === tab.key ? 'white' : '#475569',
                            boxShadow: activeTab === tab.key
                                ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                        {tab.key === 'campaigns' && pendingCount > 0 && (
                            <span style={{
                                background: '#f59e0b', color: 'white',
                                borderRadius: '20px', fontSize: '10px',
                                fontWeight: '800', padding: '1px 7px',
                                minWidth: '18px', textAlign: 'center'
                            }}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <div>
                    {/* Filter */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENT', 'FAILED', 'REJECTED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '6px 14px', borderRadius: '8px',
                                    fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', border: 'none',
                                    background: filter === f
                                        ? 'rgba(124,58,237,0.2)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: filter === f ? '#c084fc' : '#475569',
                                    borderWidth: '1px', borderStyle: 'solid',
                                    borderColor: filter === f
                                        ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                                {f === 'PENDING_APPROVAL' && pendingCount > 0 && ` (${pendingCount})`}
                            </button>
                        ))}
                    </div>

                    {filteredCampaigns.length === 0 ? (
                        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
                            <Megaphone size={40} color="#334155" style={{ marginBottom: '12px' }} />
                            <p style={{ color: '#475569', margin: '0' }}>
                                No {filter === 'ALL' ? '' : filter.replace('_', ' ').toLowerCase()} campaigns
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredCampaigns.map(campaign => {
                                const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.DRAFT;
                                return (
                                    <div key={campaign.id} style={cardStyle}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                            <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: 'rgba(124,58,237,0.15)',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    <Megaphone size={20} color="#c084fc" />
                                                </div>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                        <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px', margin: '0' }}>
                                                            {campaign.name}
                                                        </h3>
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: '20px',
                                                            fontSize: '11px', fontWeight: '700',
                                                            background: status.bg, color: status.color
                                                        }}>
                                                            {status.label}
                                                        </span>
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: '20px',
                                                            fontSize: '11px', fontWeight: '600',
                                                            background: 'rgba(255,255,255,0.07)', color: '#64748b'
                                                        }}>
                                                            {campaign.type}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {campaign.message}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                        <span style={{ color: '#475569', fontSize: '12px' }}>
                                                            Group #{campaign.groupId}
                                                        </span>
                                                        <span style={{ color: '#475569', fontSize: '12px' }}>
                                                            User #{campaign.createdBy}
                                                        </span>
                                                        <span style={{ color: '#475569', fontSize: '12px' }}>
                                                            {new Date(campaign.createdAt).toLocaleString('en-IN')}
                                                        </span>
                                                        {campaign.scheduledAt && (
                                                            <span style={{ color: '#38bdf8', fontSize: '12px' }}>
                                                                Scheduled: {new Date(campaign.scheduledAt).toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                                {campaign.status === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(campaign.id)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                padding: '9px 16px', borderRadius: '9px',
                                                                background: 'rgba(34,197,94,0.15)',
                                                                border: '1px solid rgba(34,197,94,0.3)',
                                                                color: '#4ade80', cursor: 'pointer',
                                                                fontSize: '13px', fontWeight: '600'
                                                            }}
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(campaign.id)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                padding: '9px 16px', borderRadius: '9px',
                                                                background: 'rgba(239,68,68,0.15)',
                                                                border: '1px solid rgba(239,68,68,0.3)',
                                                                color: '#f87171', cursor: 'pointer',
                                                                fontSize: '13px', fontWeight: '600'
                                                            }}
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {campaign.status === 'SCHEDULED' && (
                                                    <button
                                                        onClick={() => handleApprove(campaign.id)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '9px 16px', borderRadius: '9px',
                                                            background: 'rgba(14,165,233,0.15)',
                                                            border: '1px solid rgba(14,165,233,0.3)',
                                                            color: '#38bdf8', cursor: 'pointer',
                                                            fontSize: '13px', fontWeight: '600'
                                                        }}
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div style={cardStyle}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>
                            Registered Users
                        </h3>
                        <p style={{ color: '#475569', fontSize: '13px', margin: '0' }}>
                            {users.length} total users
                        </p>
                    </div>

                    {users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Users size={40} color="#334155" style={{ marginBottom: '12px' }} />
                            <p style={{ color: '#475569', margin: '0' }}>No users found</p>
                        </div>
                    ) : (
                        <div>
                            {users.map((user, i) => (
                                <div key={user.id} style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', padding: '16px 0',
                                    borderBottom: i < users.length - 1
                                        ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '12px',
                                            background: user.role === 'ADMIN'
                                                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontWeight: '700',
                                            color: 'white', fontSize: '16px'
                                        }}>
                                            {user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px', margin: '0 0 3px' }}>
                                                {user.name || user.email?.split('@')[0]}
                                            </p>
                                            <p style={{ color: '#475569', fontSize: '12px', margin: '0' }}>
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px',
                                            fontSize: '11px', fontWeight: '700',
                                            background: user.role === 'ADMIN'
                                                ? 'rgba(124,58,237,0.2)' : 'rgba(37,99,235,0.15)',
                                            color: user.role === 'ADMIN' ? '#c084fc' : '#60a5fa'
                                        }}>
                                            {user.role}
                                        </span>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px',
                                            fontSize: '11px', fontWeight: '600',
                                            background: user.active
                                                ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: user.active ? '#4ade80' : '#f87171'
                                        }}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => setTopUpModal(user)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '8px 14px', borderRadius: '9px',
                                                background: 'rgba(34,197,94,0.1)',
                                                border: '1px solid rgba(34,197,94,0.25)',
                                                color: '#4ade80', cursor: 'pointer',
                                                fontSize: '12px', fontWeight: '600'
                                            }}
                                        >
                                            <CreditCard size={13} /> Top Up
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Top Up Modal */}
            {topUpModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px', padding: '32px',
                        width: '100%', maxWidth: '400px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', margin: '0 0 6px' }}>
                            Top Up Credits
                        </h3>
                        <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 24px' }}>
                            Adding credits for <strong style={{ color: '#f1f5f9' }}>{topUpModal.email}</strong>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                            {[50, 100, 200, 500].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setTopUpAmount(String(amt))}
                                    style={{
                                        padding: '10px', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                                        background: topUpAmount === String(amt)
                                            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                            : 'rgba(255,255,255,0.07)',
                                        border: topUpAmount === String(amt)
                                            ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                                        color: topUpAmount === String(amt) ? 'white' : '#94a3b8',
                                    }}
                                >
                                    {amt}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleTopUp}>
                            <input
                                type="number" min="1" placeholder="Custom amount"
                                value={topUpAmount}
                                onChange={e => setTopUpAmount(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 14px', marginBottom: '20px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px', fontSize: '16px',
                                    color: 'white', outline: 'none',
                                    fontFamily: 'inherit', boxSizing: 'border-box',
                                    fontWeight: '700'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setTopUpModal(null); setTopUpAmount(''); }}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#94a3b8', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        border: 'none', color: 'white', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(124,58,237,0.35)'
                                    }}
                                >
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