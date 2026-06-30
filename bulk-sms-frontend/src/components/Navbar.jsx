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
    '/users': 'User Management',
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
            background: '#ffffff',
            borderBottom: '1px solid #e6e9f7',
            padding: '0 28px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
        }}>
            <div>
                <h2 style={{
                    fontSize: '17px', fontWeight: '700',
                    color: '#1e293b', margin: '0', letterSpacing: '-0.2px',
                }}>
                    {pageTitle}
                </h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '1px 0 0', fontWeight: '600' }}>
                    Bulk SMS Management System — NIC
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    onClick={() => navigate('/notifications')}
                    style={{
                        position: 'relative', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '9px 14px', borderRadius: '11px',
                        border: '1px solid #f3d27a',
                        background: '#fdedc4',
                        color: '#8a5d0a', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fbe19a'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fdedc4'}
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            background: '#f97a8c',
                            color: 'white', fontSize: '10px', fontWeight: '700',
                            borderRadius: '20px', minWidth: '18px', height: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 4px', border: '2px solid white',
                        }}>
            {unreadCount}
        </span>
                    )}
                </button>

                <div style={{ width: '1px', height: '26px', background: '#e6e9f7', margin: '0 2px' }} />

                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '9px 18px', borderRadius: '11px',
                        border: '1px solid #fad1d9',
                        background: '#fde3e8',
                        color: '#d44d6a', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fbc6d0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fde3e8'}
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </header>
    );
}