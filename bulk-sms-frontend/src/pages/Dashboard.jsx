import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Megaphone, Users, CreditCard, Bell,
    TrendingUp, Clock, ArrowRight, Send,
    AlertTriangle, XCircle
} from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCampaigns: 0, sentCampaigns: 0,
        pendingCampaigns: 0, failedMessages: 0,
        credits: 0, unreadNotifications: 0
    });
    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [chartData, setChartData] = useState({ sent: [], failed: [] });
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, balanceRes, notifRes] = await Promise.all([
                api.get('/api/campaigns/my'),
                api.get('/api/billing/balance'),
                api.get('/api/notifications/unread/count')
            ]);
            const campaigns = campaignsRes.data;
            setRecentCampaigns(campaigns.slice(0, 5));

            const { failedCount, chartData: cData } = await fetchMessageData(campaigns);

            setStats({
                totalCampaigns: campaigns.length,
                sentCampaigns: campaigns.filter(c => c.status === 'SENT').length,
                pendingCampaigns: campaigns.filter(c =>
                    c.status === 'PENDING_APPROVAL' || c.status === 'DRAFT').length,
                failedMessages: failedCount,
                credits: balanceRes.data.credits,
                unreadNotifications: notifRes.data.count
            });
            setChartData(cData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setChartLoading(false);
        }
    };

    const fetchMessageData = async (campaigns) => {
        try {
            const now = new Date();
            const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
            const monday = new Date(now);
            monday.setDate(now.getDate() - dayOfWeek);
            monday.setHours(0, 0, 0, 0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            const sentCampaigns = campaigns.filter(c => c.status === 'SENT' || c.status === 'FAILED');
            const reportResults = await Promise.all(
                sentCampaigns.map(c =>
                    api.get(`/api/reports/campaign/${c.id}`).then(r => r.data).catch(() => null)
                )
            );

            const sentPoints = [];
            const failedPoints = [];
            let totalFailedAllTime = 0;

            reportResults.filter(Boolean).forEach(report => {
                (report.logs || []).forEach(log => {
                    if (log.status === 'FAILED') totalFailedAllTime++;
                    if (!log.sentAt) return;
                    const d = new Date(log.sentAt);
                    if (d < monday || d > sunday) return;
                    const dow = (d.getDay() + 6) % 7;
                    const hour = d.getHours() + d.getMinutes() / 60;
                    const point = { day: dow, hour, recipient: log.recipient };
                    if (log.status === 'SENT') sentPoints.push(point);
                    else failedPoints.push(point);
                });
            });

            return {
                failedCount: totalFailedAllTime,
                chartData: { sent: sentPoints, failed: failedPoints }
            };
        } catch (err) {
            console.error(err);
            return { failedCount: 0, chartData: { sent: [], failed: [] } };
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'SENT': { bg: '#bce8cb', color: '#1c6b3b' },
            'APPROVED': { bg: '#c7d2f9', color: '#2c3e9e' },
            'PENDING_APPROVAL': { bg: '#fbe19a', color: '#8a5d0a' },
            'DRAFT': { bg: '#d8dae8', color: '#454a63' },
            'FAILED': { bg: '#f7b8c4', color: '#a31f3c' },
            'SCHEDULED': { bg: '#a9ddf0', color: '#0d5f80' },
        };
        return map[status] || { bg: '#d8dae8', color: '#454a63' };
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid #e6e9f7',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#475569', fontWeight: '700' }}>Loading dashboard...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                    <span style={{ color: '#3b82f6' }}>{user?.email?.split('@')[0]}</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Low balance warning */}
            {stats.credits <= 10 && (
                <div style={{
                    background: '#f7b8c4',
                    borderRadius: '14px',
                    padding: '16px 20px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '24px', gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.5)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <AlertTriangle size={20} color="#a31f3c" />
                        </div>
                        <div>
                            <p style={{ fontWeight: '800', color: '#a31f3c', margin: '0', fontSize: '14px' }}>
                                Low Credit Balance
                            </p>
                            <p style={{ color: '#812942', fontSize: '13px', margin: '2px 0 0', fontWeight: '600' }}>
                                Only {stats.credits} credits left. Top up to keep sending campaigns.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/billing')} style={{
                        padding: '9px 20px', background: '#a31f3c', color: 'white',
                        border: 'none', borderRadius: '9px', fontSize: '13px',
                        fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                        Top Up Now
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Campaigns', value: stats.totalCampaigns, icon: Megaphone, bg: '#aebcf5', color: '#1f2f8a', path: '/campaigns' },
                    { label: 'Campaigns Sent', value: stats.sentCampaigns, icon: Send, bg: '#93dba9', color: '#125a2c', path: '/campaigns' },
                    { label: 'Pending Approval', value: stats.pendingCampaigns, icon: Clock, bg: '#f7d36b', color: '#704800', path: '/campaigns' },
                    { label: 'Failed Messages', value: stats.failedMessages, icon: XCircle, bg: '#f193a6', color: '#7a1530', path: '/reports' },
                ].map((card) => (
                    <div
                        key={card.label}
                        onClick={() => navigate(card.path)}
                        style={{
                            background: card.bg, borderRadius: '16px', padding: '20px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            position: 'relative', overflow: 'hidden',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {/* decorative bubbles */}
                        <div style={{
                            position: 'absolute', top: '-26px', right: '-26px',
                            width: '90px', height: '90px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-30px', right: '20px',
                            width: '50px', height: '50px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.18)',
                        }} />

                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.55)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            marginBottom: '16px', position: 'relative',
                        }}>
                            <card.icon size={22} color={card.color} />
                        </div>
                        <p style={{ fontSize: '30px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px', position: 'relative' }}>
                            {card.value}
                        </p>
                        <p style={{ fontSize: '13px', color: card.color, margin: '0', fontWeight: '800', position: 'relative' }}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Weekly Message Volume Chart */}
            <div style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                border: '1px solid #eceefb', marginBottom: '24px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0' }}>
                            Weekly Message Volume
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '600' }}>
                            Sent vs failed messages by day and hour — this week
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2f9b56' }} />
                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '700' }}>Sent</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d44d6a' }} />
                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '700' }}>Failed</span>
                        </div>
                    </div>
                </div>

                {chartLoading ? (
                    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                        Loading chart data...
                    </div>
                ) : (chartData.sent.length === 0 && chartData.failed.length === 0) ? (
                    <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                        No messages sent this week yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                            <CartesianGrid stroke="#eef0f9" />
                            <XAxis
                                type="number"
                                dataKey="day"
                                domain={[-0.5, 6.5]}
                                ticks={[0, 1, 2, 3, 4, 5, 6]}
                                tickFormatter={(v) => DAY_LABELS[v]}
                                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={false}
                            />
                            <YAxis
                                type="number"
                                dataKey="hour"
                                domain={[0, 24]}
                                ticks={[0, 4, 8, 12, 16, 20, 24]}
                                tickFormatter={(v) => `${String(v).padStart(2, '0')}:00`}
                                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={false}
                                width={50}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const p = payload[0].payload;
                                    const h = Math.floor(p.hour);
                                    const m = Math.round((p.hour - h) * 60);
                                    return (
                                        <div style={{
                                            background: 'white', border: '1px solid #cbd5e1',
                                            borderRadius: '10px', padding: '10px 14px',
                                            fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            <p style={{ margin: '0 0 4px', fontWeight: '800', color: '#1e293b' }}>
                                                {DAY_LABELS[p.day]} · {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
                                            </p>
                                            <p style={{ margin: '0', color: '#374151', fontWeight: '600' }}>{p.recipient}</p>
                                        </div>
                                    );
                                }}
                            />
                            <Scatter name="Sent" data={chartData.sent} fill="#2f9b56" />
                            <Scatter name="Failed" data={chartData.failed} fill="#d44d6a" />
                        </ScatterChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

                {/* Recent Campaigns */}
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '24px',
                    border: '1px solid #eceefb',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0' }}>
                                Recent Campaigns
                            </h3>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '600' }}>
                                Your latest campaign activity
                            </p>
                        </div>
                        <button onClick={() => navigate('/campaigns')} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            border: 'none', background: '#dde3fb',
                            color: '#2c3e9e', fontSize: '13px', fontWeight: '800', cursor: 'pointer'
                        }}>
                            View all <ArrowRight size={14} />
                        </button>
                    </div>

                    {recentCampaigns.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: '#dde3fb', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 16px'
                            }}>
                                <Megaphone size={28} color="#2c3e9e" />
                            </div>
                            <p style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>
                                No campaigns yet
                            </p>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px', fontWeight: '600' }}>
                                Create your first campaign to get started
                            </p>
                            <button onClick={() => navigate('/campaigns')} style={{
                                padding: '10px 24px', background: '#3b82f6',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
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
                                    justifyContent: 'space-between', padding: '14px 0',
                                    borderBottom: i < recentCampaigns.length - 1 ? '1px solid #eef0f9' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: '#dde3fb',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Megaphone size={18} color="#2c3e9e" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '800', color: '#1e293b', margin: '0', fontSize: '14px' }}>
                                                {campaign.name}
                                            </p>
                                            <p style={{ color: '#475569', fontSize: '12px', margin: '2px 0 0', fontWeight: '600' }}>
                                                {campaign.type} • {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px',
                                        fontSize: '11px', fontWeight: '800',
                                        background: badge.bg, color: badge.color
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

                    {/* Credit Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
                        borderRadius: '16px', padding: '24px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <CreditCard size={18} color="white" />
                            <p style={{ color: '#dbeafe', fontSize: '12px', fontWeight: '800', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Credit Balance
                            </p>
                        </div>
                        <p style={{ color: 'white', fontSize: '42px', fontWeight: '800', margin: '0 0 4px', lineHeight: 1 }}>
                            {stats.credits}
                        </p>
                        <p style={{ color: '#dbeafe', fontSize: '13px', margin: '0 0 20px', fontWeight: '600' }}>
                            credits available
                        </p>
                        <button onClick={() => navigate('/billing')} style={{
                            width: '100%', padding: '11px',
                            background: 'rgba(255,255,255,0.22)',
                            color: 'white', border: 'none',
                            borderRadius: '10px', fontSize: '14px', fontWeight: '800',
                            cursor: 'pointer',
                        }}>
                            + Top Up Credits
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '20px',
                        border: '1px solid #eceefb',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 14px' }}>
                            Quick Actions
                        </h3>
                        {[
                            { label: 'New Campaign', icon: Megaphone, bg: '#dde3fb', color: '#2c3e9e', path: '/campaigns' },
                            { label: 'Add Contacts', icon: Users, bg: '#bce8cb', color: '#1c6b3b', path: '/contacts' },
                            { label: 'View Reports', icon: TrendingUp, bg: '#e1d4fa', color: '#5b2bb0', path: '/reports' },
                            { label: 'Notifications', icon: Bell, bg: '#a9ddf0', color: '#0d5f80', path: '/notifications' },
                        ].map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px', borderRadius: '10px', border: 'none',
                                    background: 'transparent', cursor: 'pointer',
                                    marginBottom: '4px', transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f4f6fd'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: action.bg, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <action.icon size={16} color={action.color} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                                    {action.label}
                                </span>
                                <ArrowRight size={14} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}