import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/contacts': 'Contact Management',
    '/campaigns': 'Campaign Management',
    '/reports': 'Delivery Reports',
    '/billing': 'Billing & Credits',
    '/notifications': 'Notifications',
    '/admin': 'Admin Panel',
};

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await api.get('/api/notifications/unread/count');
                setUnreadCount(res.data.count);
            } catch {
                setUnreadCount(0);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    const pageTitle = pageTitles[location.pathname] || 'Bulk SMS System';

    return (
        <header style={{
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '0 28px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
        }}>
            {/* Page title */}
            <div>
                <h2 style={{
                    fontSize: '17px', fontWeight: '700',
                    color: '#f1f5f9', margin: '0', letterSpacing: '-0.2px',
                }}>
                    {pageTitle}
                </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Notification Bell */}
                <button
                    onClick={() => navigate('/notifications')}
                    style={{
                        position: 'relative', width: '40px', height: '40px',
                        borderRadius: '11px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#94a3b8', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white', fontSize: '10px', fontWeight: '700',
                            borderRadius: '20px', minWidth: '18px', height: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 4px', border: '2px solid #0f172a',
                            boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Divider */}
                <div style={{
                    width: '1px', height: '26px',
                    background: 'rgba(255,255,255,0.08)', margin: '0 2px',
                }} />

                {/* Logout */}
                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '9px 18px', borderRadius: '11px',
                        border: '1px solid rgba(239,68,68,0.35)',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#fca5a5', fontSize: '13px', fontWeight: '600',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                        e.currentTarget.style.color = '#fecaca';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                        e.currentTarget.style.color = '#fca5a5';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                    }}
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </header>
    );
}