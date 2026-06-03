import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Megaphone, Users, CreditCard, Bell,
    TrendingUp, Clock, ArrowRight, Send, AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCampaigns: 0, sentCampaigns: 0,
        pendingCampaigns: 0, credits: 0, unreadNotifications: 0,
    });
    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, balanceRes, notifRes] = await Promise.all([
                api.get('/api/campaigns/my'),
                api.get('/api/billing/balance'),
                api.get('/api/notifications/unread/count'),
            ]);
            const campaigns = campaignsRes.data;
            setRecentCampaigns(campaigns.slice(0, 5));
            setStats({
                totalCampaigns: campaigns.length,
                sentCampaigns: campaigns.filter(c => c.status === 'SENT').length,
                pendingCampaigns: campaigns.filter(c =>
                    c.status === 'PENDING_APPROVAL' || c.status === 'DRAFT').length,
                credits: balanceRes.data.credits,
                unreadNotifications: notifRes.data.count,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'SENT':             { bg: 'rgba(16,185,129,0.18)',  color: '#6ee7b7' },
            'APPROVED':         { bg: 'rgba(59,130,246,0.18)',  color: '#93c5fd' },
            'PENDING_APPROVAL': { bg: 'rgba(251,191,36,0.18)',  color: '#fcd34d' },
            'DRAFT':            { bg: 'rgba(100,116,139,0.2)',  color: '#94a3b8' },
            'FAILED':           { bg: 'rgba(239,68,68,0.18)',   color: '#fca5a5' },
            'SCHEDULED':        { bg: 'rgba(14,165,233,0.18)',  color: '#7dd3fc' },
        };
        return map[status] || { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8' };
    };

    // 3 stat cards — Credit Balance removed (shown in the widget below)
    const statCards = [
        {
            label: 'Total Campaigns',
            value: stats.totalCampaigns,
            icon: Megaphone,
            gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            circleBg: '#a78bfa',
            path: '/campaigns',
        },
        {
            label: 'Campaigns Sent',
            value: stats.sentCampaigns,
            icon: Send,
            gradient: 'linear-gradient(135deg, #064e3b, #059669)',
            circleBg: '#6ee7b7',
            path: '/campaigns',
        },
        {
            label: 'Pending Approval',
            value: stats.pendingCampaigns,
            icon: Clock,
            gradient: 'linear-gradient(135deg, #831843, #db2777)',
            circleBg: '#f9a8d4',
            path: '/campaigns',
        },
    ];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
                }} />
                <p style={{ color: '#94a3b8', fontWeight: '500' }}>Loading dashboard...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                    <span style={{ color: '#60a5fa' }}>{user?.email?.split('@')[0]}</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0', fontWeight: '500' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Low balance warning */}
            {stats.credits <= 10 && (
                <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '14px', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '24px', gap: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <AlertTriangle size={20} color="#fca5a5" />
                        </div>
                        <div>
                            <p style={{ fontWeight: '700', color: '#fca5a5', margin: '0', fontSize: '14px' }}>
                                Low Credit Balance
                            </p>
                            <p style={{ color: '#f87171', fontSize: '13px', margin: '2px 0 0' }}>
                                Only {stats.credits} credits left. Top up to keep sending campaigns.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/billing')} style={{
                        padding: '9px 20px',
                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                        color: 'white', border: 'none', borderRadius: '9px',
                        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                        whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
                    }}>
                        Top Up Now
                    </button>
                </div>
            )}

            {/* 3 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        onClick={() => navigate(card.path)}
                        style={{
                            background: card.gradient,
                            borderRadius: '18px', padding: '24px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            overflow: 'hidden', position: 'relative',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.35)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '-28px', right: '-28px',
                            width: '110px', height: '110px', borderRadius: '50%',
                            background: card.circleBg, opacity: 0.15,
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-20px', left: '-20px',
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                        }} />
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '13px',
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '18px',
                        }}>
                            <card.icon size={22} color="white" />
                        </div>
                        <p style={{ fontSize: '38px', fontWeight: '800', color: 'white', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-1px' }}>
                            {card.value}
                        </p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0', fontWeight: '600' }}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bottom section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

                {/* Recent Campaigns */}
                <div style={{
                    background: 'rgba(15,23,42,0.7)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '18px', padding: '24px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: '0' }}>
                                Recent Campaigns
                            </h3>
                            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '5px 0 0', fontWeight: '500' }}>
                                Your latest campaign activity
                            </p>
                        </div>
                        <button onClick={() => navigate('/campaigns')} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '9px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#93c5fd', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >
                            View all <ArrowRight size={13} />
                        </button>
                    </div>

                    {recentCampaigns.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: 'rgba(37,99,235,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Megaphone size={28} color="#60a5fa" />
                            </div>
                            <p style={{ fontWeight: '600', color: '#e2e8f0', margin: '0 0 6px' }}>
                                No campaigns yet
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px', fontWeight: '500' }}>
                                Create your first campaign to get started
                            </p>
                            <button onClick={() => navigate('/campaigns')} style={{
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                            }}>
                                Create Campaign
                            </button>
                        </div>
                    ) : (
                        recentCampaigns.map((campaign, i) => {
                            const badge = getStatusBadge(campaign.status);
                            return (
                                <div key={campaign.id} style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', padding: '13px 0',
                                    borderBottom: i < recentCampaigns.length - 1
                                        ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Megaphone size={17} color="white" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#f1f5f9', margin: '0', fontSize: '14px' }}>
                                                {campaign.name}
                                            </p>
                                            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '3px 0 0', fontWeight: '500' }}>
                                                {campaign.type} • {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px',
                                        fontSize: '11px', fontWeight: '700',
                                        background: badge.bg, color: badge.color,
                                    }}>
                                        {campaign.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Credit Balance — yellow theme */}
                    <div style={{
                        background: 'linear-gradient(135deg, #78350f, #b45309, #d97706)',
                        borderRadius: '18px', padding: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 28px rgba(217,119,6,0.3)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-30px', right: '-30px',
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: '#fcd34d', opacity: 0.12,
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-20px', left: '-20px',
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <CreditCard size={16} color="#fcd34d" />
                            <p style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '700', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Credit Balance
                            </p>
                        </div>
                        <p style={{ color: 'white', fontSize: '44px', fontWeight: '800', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-2px' }}>
                            {stats.credits}
                        </p>
                        <p style={{ color: '#fde68a', fontSize: '13px', margin: '0 0 20px', fontWeight: '500' }}>
                            credits available
                        </p>
                        <button onClick={() => navigate('/billing')} style={{
                            width: '100%', padding: '11px',
                            background: 'rgba(255,255,255,0.15)',
                            color: 'white', border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: '11px', fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            + Top Up Credits
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        background: 'rgba(15,23,42,0.7)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '18px', padding: '20px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 14px' }}>
                            Quick Actions
                        </h3>
                        {[
                            { label: 'New Campaign',  icon: Megaphone,  gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)', path: '/campaigns' },
                            { label: 'Add Contacts',  icon: Users,      gradient: 'linear-gradient(135deg, #064e3b, #059669)', path: '/contacts' },
                            { label: 'View Reports',  icon: TrendingUp, gradient: 'linear-gradient(135deg, #831843, #db2777)', path: '/reports' },
                            { label: 'Notifications', icon: Bell,       gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)', path: '/notifications' },
                        ].map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px', borderRadius: '11px', border: 'none',
                                    background: 'transparent', cursor: 'pointer',
                                    marginBottom: '4px', transition: 'background 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '9px',
                                    background: action.gradient,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <action.icon size={15} color="white" />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                                    {action.label}
                                </span>
                                <ArrowRight size={13} color="#475569" style={{ marginLeft: 'auto' }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}