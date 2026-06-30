import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Megaphone, BarChart3,
    CreditCard, Bell, ShieldCheck, MessageSquare,
    Users as UsersIcon
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
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Logo */}
            <div style={{ padding: '28px 20px 22px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '13px',
                        background: 'rgba(255,255,255,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <MessageSquare size={20} color="white" />
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: '800', fontSize: '15px', margin: '0', letterSpacing: '-0.3px' }}>
                            Bulk SMS
                        </p>
                        <p style={{ color: '#bfdbfe', fontSize: '11px', margin: '2px 0 0', fontWeight: '600' }}>
                            NIC System
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{
                    color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: '700',
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
                            background: isActive ? 'white' : 'transparent',
                            color: isActive ? '#1d4ed8' : '#dbeafe',
                            fontWeight: isActive ? '700' : '600',
                        })}
                        onMouseEnter={e => {
                            if (!e.currentTarget.getAttribute('aria-current')) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!e.currentTarget.getAttribute('aria-current')) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Icon size={17} />
                        </div>
                        <span style={{ fontSize: '13.5px' }}>{label}</span>
                    </NavLink>
                ))}

                {user?.role === 'ADMIN' && (
                    <>
                        <p style={{
                            color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: '700',
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
                                background: isActive ? 'white' : 'transparent',
                                color: isActive ? '#7c3aed' : '#dbeafe',
                                fontWeight: isActive ? '700' : '600',
                            })}
                        >
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <ShieldCheck size={17} />
                            </div>
                            <span style={{ fontSize: '13.5px' }}>Admin Panel</span>
                        </NavLink>
                        <NavLink
                            to="/users"
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '11px',
                                padding: '10px 12px', borderRadius: '11px',
                                textDecoration: 'none', transition: 'all 0.18s',
                                background: isActive ? 'white' : 'transparent',
                                color: isActive ? '#7c3aed' : '#dbeafe',
                                fontWeight: isActive ? '700' : '600',
                            })}
                        >
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <UsersIcon size={17} />
                            </div>
                            <span style={{ fontSize: '13.5px' }}>Users</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* User card */}
            <div style={{
                padding: '14px', margin: '0 10px 14px',
                borderRadius: '13px',
                background: 'rgba(255,255,255,0.12)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', color: 'white', fontSize: '14px', flexShrink: 0,
                    }}>
                        {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{
                            color: 'white', fontSize: '13px', fontWeight: '700',
                            margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.email?.split('@')[0]}
                        </p>
                        <p style={{
                            color: '#bfdbfe', fontSize: '11px', margin: '1px 0 0',
                            fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>
                            {user?.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}