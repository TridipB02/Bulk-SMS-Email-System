import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Bell, CheckCheck, Megaphone, CreditCard,
    AlertTriangle, Info, Clock, Mail
} from 'lucide-react';

const NOTIFICATION_CONFIG = {
    CAMPAIGN_COMPLETED: {
        icon: Megaphone, color: '#4ade80',
        bg: 'rgba(34,197,94,0.15)', label: 'Campaign'
    },
    LOW_BALANCE: {
        icon: CreditCard, color: '#fbbf24',
        bg: 'rgba(234,179,8,0.15)', label: 'Billing'
    },
    LOW_BALANCE_WARNING: {
        icon: AlertTriangle, color: '#fb923c',
        bg: 'rgba(249,115,22,0.15)', label: 'Warning'
    },
    INSUFFICIENT_BALANCE: {
        icon: AlertTriangle, color: '#f87171',
        bg: 'rgba(239,68,68,0.15)', label: 'Alert'
    },
    DEFAULT: {
        icon: Info, color: '#60a5fa',
        bg: 'rgba(37,99,235,0.15)', label: 'Info'
    }
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | unread

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/notifications');
            setNotifications(res.data);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            toast.success('All notifications marked as read');
            fetchNotifications();
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const cardStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '24px',
    };

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        if (days > 0) return `${days}d ago`;
        if (hrs > 0) return `${hrs}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return 'Just now';
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#475569', margin: '0' }}>Loading notifications...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '800px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>
                        Notifications
                    </h1>
                    <p style={{ color: '#475569', fontSize: '14px', margin: '0' }}>
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 18px', borderRadius: '10px',
                            background: 'rgba(37,99,235,0.15)',
                            border: '1px solid rgba(37,99,235,0.3)',
                            color: '#60a5fa', fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <CheckCheck size={15} /> Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex', gap: '8px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '6px', width: 'fit-content'
            }}>
                {[
                    { key: 'all', label: `All (${notifications.length})` },
                    { key: 'unread', label: `Unread (${unreadCount})` }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
                            fontWeight: '600', cursor: 'pointer', border: 'none',
                            background: filter === tab.key
                                ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                                : 'transparent',
                            color: filter === tab.key ? 'white' : '#475569',
                            boxShadow: filter === tab.key
                                ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {filtered.length === 0 ? (
                <div style={{
                    ...cardStyle, textAlign: 'center', padding: '80px 40px'
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(37,99,235,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <Bell size={32} color="#3b82f6" />
                    </div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', margin: '0 0 8px' }}>
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </h3>
                    <p style={{ color: '#475569', margin: '0', fontSize: '14px' }}>
                        {filter === 'unread'
                            ? 'You are all caught up!'
                            : 'Notifications will appear here when campaigns complete'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filtered.map(notification => {
                        const config = NOTIFICATION_CONFIG[notification.type]
                            || NOTIFICATION_CONFIG.DEFAULT;
                        const Icon = config.icon;

                        return (
                            <div
                                key={notification.id}
                                style={{
                                    background: notification.read
                                        ? 'rgba(255,255,255,0.03)'
                                        : 'rgba(37,99,235,0.07)',
                                    border: notification.read
                                        ? '1px solid rgba(255,255,255,0.06)'
                                        : '1px solid rgba(37,99,235,0.2)',
                                    borderRadius: '14px', padding: '18px 20px',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                {/* Unread dot */}
                                {!notification.read && (
                                    <div style={{
                                        position: 'absolute', top: '20px', right: '20px',
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: '#3b82f6',
                                        boxShadow: '0 0 8px rgba(59,130,246,0.6)'
                                    }} />
                                )}

                                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: config.bg, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon size={20} color={config.color} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '6px',
                                                fontSize: '10px', fontWeight: '700',
                                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                                background: config.bg, color: config.color
                                            }}>
                                                {config.label}
                                            </span>
                                            {notification.campaignId && (
                                                <span style={{ color: '#334155', fontSize: '11px' }}>
                                                    Campaign #{notification.campaignId}
                                                </span>
                                            )}
                                        </div>

                                        <p style={{
                                            color: notification.read ? '#64748b' : '#e2e8f0',
                                            fontSize: '14px', margin: '0 0 8px',
                                            lineHeight: '1.5', fontWeight: notification.read ? '400' : '500'
                                        }}>
                                            {notification.message}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                color: '#334155', fontSize: '12px',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}>
                                                <Clock size={11} />
                                                {getTimeAgo(notification.createdAt)}
                                                {' · '}
                                                {new Date(notification.createdAt).toLocaleString('en-IN')}
                                            </span>
                                            {notification.emailSent && (
                                                <span style={{
                                                    color: '#334155', fontSize: '12px',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    <Mail size={11} color="#475569" />
                                                    Email sent
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}