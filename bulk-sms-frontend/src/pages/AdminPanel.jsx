import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    ShieldCheck, Megaphone, CheckCircle, XCircle,
    Clock, Send
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT:            { bg: '#e7e8f2', color: '#454a63', label: 'Draft' },
    PENDING_APPROVAL: { bg: '#fbe19a', color: '#8a5d0a', label: 'Pending' },
    APPROVED:         { bg: '#c7d2f9', color: '#2c3e9e', label: 'Approved' },
    SCHEDULED:        { bg: '#a9ddf0', color: '#0d5f80', label: 'Scheduled' },
    SENT:             { bg: '#bce8cb', color: '#1c6b3b', label: 'Sent' },
    FAILED:           { bg: '#f7b8c4', color: '#a31f3c', label: 'Failed' },
    REJECTED:         { bg: '#f7b8c4', color: '#a31f3c', label: 'Rejected' },
};

export default function AdminPanel() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING_APPROVAL');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/campaigns');
            setCampaigns(res.data);
        } catch {
            toast.error('Failed to load campaigns');
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

    const filteredCampaigns = filter === 'ALL'
        ? campaigns
        : campaigns.filter(c => c.status === filter);

    const pendingCount = campaigns.filter(c => c.status === 'PENDING_APPROVAL').length;
    const sentCount = campaigns.filter(c => c.status === 'SENT').length;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid #e2e7f7',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#64748b', margin: '0', fontWeight: '600' }}>Loading admin panel...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1100px' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#e1d4fa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={20} color="#5b2bb0" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0' }}>
                            Admin Panel
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0', fontWeight: '600' }}>
                            Approve, reject and review campaigns
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Campaigns', value: campaigns.length, color: '#1f2f8a', bg: '#aebcf5', icon: Megaphone },
                    { label: 'Pending Approval', value: pendingCount, color: '#704800', bg: '#f7d36b', icon: Clock },
                    { label: 'Sent', value: sentCount, color: '#125a2c', bg: '#93dba9', icon: Send },
                ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: '16px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: '-22px', right: '-22px',
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.3)',
                        }} />
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '9px',
                            background: 'rgba(255,255,255,0.55)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative',
                        }}>
                            <s.icon size={18} color={s.color} />
                        </div>
                        <p style={{ color: s.color, fontSize: '11px', fontWeight: '800', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', position: 'relative' }}>
                            {s.label}
                        </p>
                        <p style={{ color: '#1e293b', fontSize: '26px', fontWeight: '800', margin: '0', position: 'relative' }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENT', 'FAILED', 'REJECTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 14px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', border: 'none',
                            background: filter === f ? '#e1d4fa' : 'white',
                            color: filter === f ? '#5b2bb0' : '#64748b',
                        }}
                    >
                        {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                        {f === 'PENDING_APPROVAL' && pendingCount > 0 && ` (${pendingCount})`}
                    </button>
                ))}
            </div>

            {filteredCampaigns.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #eceefb', borderRadius: '16px', textAlign: 'center', padding: '60px' }}>
                    <Megaphone size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                    <p style={{ color: '#64748b', margin: '0', fontWeight: '600' }}>
                        No {filter === 'ALL' ? '' : filter.replace('_', ' ').toLowerCase()} campaigns
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredCampaigns.map(campaign => {
                        const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.DRAFT;
                        return (
                            <div key={campaign.id} style={{ background: 'white', border: '1px solid #eceefb', borderRadius: '16px', padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: '#e1d4fa',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <Megaphone size={20} color="#5b2bb0" />
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                <h3 style={{ color: '#1e293b', fontWeight: '800', fontSize: '15px', margin: '0' }}>
                                                    {campaign.name}
                                                </h3>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px',
                                                    fontSize: '11px', fontWeight: '800',
                                                    background: status.bg, color: status.color
                                                }}>
                                                    {status.label}
                                                </span>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px',
                                                    fontSize: '11px', fontWeight: '700',
                                                    background: '#f1f2fa', color: '#64748b'
                                                }}>
                                                    {campaign.type}
                                                </span>
                                            </div>
                                            <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                                {campaign.message}
                                            </p>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                                                    Group #{campaign.groupId}
                                                </span>
                                                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                                                    User #{campaign.createdBy}
                                                </span>
                                                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                                                    {new Date(campaign.createdAt).toLocaleString('en-IN')}
                                                </span>
                                                {campaign.scheduledAt && (
                                                    <span style={{ color: '#0d5f80', fontSize: '12px', fontWeight: '600' }}>
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
                                                        background: '#d9f2e0',
                                                        border: 'none',
                                                        color: '#1c6b3b', cursor: 'pointer',
                                                        fontSize: '13px', fontWeight: '700'
                                                    }}
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(campaign.id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '9px 16px', borderRadius: '9px',
                                                        background: '#fde3e8',
                                                        border: 'none',
                                                        color: '#d44d6a', cursor: 'pointer',
                                                        fontSize: '13px', fontWeight: '700'
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
                                                    background: '#d6eef9',
                                                    border: 'none',
                                                    color: '#0d5f80', cursor: 'pointer',
                                                    fontSize: '13px', fontWeight: '700'
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

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}