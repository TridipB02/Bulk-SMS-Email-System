import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Megaphone, BarChart3,
    CreditCard, Bell, ShieldCheck, MessageSquare
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/contacts', icon: Users, label: 'Contacts' },
    { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/billing', icon: CreditCard, label: 'Billing' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <div style={{
            width: '240px',
            minHeight: '100vh',
            flexShrink: 0,
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '4px 0 32px rgba(0,0,0,0.3)',
        }}>
            {/* Logo */}
            <div style={{
                padding: '28px 20px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '13px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
                        flexShrink: 0,
                    }}>
                        <MessageSquare size={20} color="white" />
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: '800', fontSize: '15px', margin: '0', letterSpacing: '-0.3px' }}>
                            Bulk SMS
                        </p>
                        <p style={{ color: '#475569', fontSize: '11px', margin: '2px 0 0', fontWeight: '500' }}>
                            NIC System
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <p style={{
                    color: '#334155', fontSize: '10px', fontWeight: '700',
                    letterSpacing: '1.2px', textTransform: 'uppercase',
                    padding: '0 10px', margin: '0 0 10px',
                }}>
                    Main Menu
                </p>

                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '11px',
                            padding: '10px 12px', borderRadius: '11px',
                            textDecoration: 'none', transition: 'all 0.18s',
                            background: isActive
                                ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                                : 'transparent',
                            color: isActive ? 'white' : '#64748b',
                            boxShadow: isActive ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
                            fontWeight: isActive ? '600' : '500',
                        })}
                        onMouseEnter={e => {
                            if (!e.currentTarget.getAttribute('aria-current')) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.color = '#cbd5e1';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!e.currentTarget.getAttribute('aria-current')) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                            }
                        }}
                    >
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)', flexShrink: 0,
                        }}>
                            <Icon size={16} />
                        </div>
                        <span style={{ fontSize: '13.5px' }}>{label}</span>
                    </NavLink>
                ))}

                {user?.role === 'ADMIN' && (
                    <>
                        <p style={{
                            color: '#334155', fontSize: '10px', fontWeight: '700',
                            letterSpacing: '1.2px', textTransform: 'uppercase',
                            padding: '0 10px', margin: '18px 0 10px',
                        }}>
                            Admin
                        </p>
                        <NavLink
                            to="/admin"
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '11px',
                                padding: '10px 12px', borderRadius: '11px',
                                textDecoration: 'none', transition: 'all 0.18s',
                                background: isActive
                                    ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                    : 'transparent',
                                color: isActive ? 'white' : '#64748b',
                                boxShadow: isActive ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                                fontWeight: isActive ? '600' : '500',
                            })}
                            onMouseEnter={e => {
                                if (!e.currentTarget.getAttribute('aria-current')) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.color = '#cbd5e1';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!e.currentTarget.getAttribute('aria-current')) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }
                            }}
                        >
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(255,255,255,0.05)', flexShrink: 0,
                            }}>
                                <ShieldCheck size={16} />
                            </div>
                            <span style={{ fontSize: '13.5px' }}>Admin Panel</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* User card */}
            <div style={{
                padding: '14px', margin: '0 10px 14px',
                borderRadius: '13px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', color: 'white', fontSize: '14px', flexShrink: 0,
                        boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
                    }}>
                        {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{
                            color: '#e2e8f0', fontSize: '13px', fontWeight: '600',
                            margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.email?.split('@')[0]}
                        </p>
                        <p style={{
                            color: '#475569', fontSize: '11px', margin: '1px 0 0',
                            fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>
                            {user?.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}