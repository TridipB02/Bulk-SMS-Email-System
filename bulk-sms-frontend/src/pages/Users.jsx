import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Users as UsersIcon, CreditCard, Trash2,
    UserCheck, UserX, ChevronDown, ShieldCheck
} from 'lucide-react';

const ROLES = ['ADMIN', 'MAKER', 'CHECKER', 'APPROVER'];

const ROLE_STYLE = {
    ADMIN:    { bg: '#e1d4fa', color: '#5b2bb0' },
    MAKER:    { bg: '#c7d2f9', color: '#2c3e9e' },
    CHECKER:  { bg: '#fbe19a', color: '#8a5d0a' },
    APPROVER: { bg: '#a9ddf0', color: '#0d5f80' },
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topUpModal, setTopUpModal] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [roleMenuOpenFor, setRoleMenuOpenFor] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (user, newRole) => {
        setRoleMenuOpenFor(null);
        if (newRole === user.role) return;
        try {
            await api.put(`/api/users/${user.id}/role`, { role: newRole });
            toast.success(`${user.email} is now ${newRole}`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDeactivate = async (user) => {
        if (!confirm(`Deactivate ${user.email}? They will be unable to log in.`)) return;
        try {
            await api.delete(`/api/users/${user.id}`);
            toast.success('User deactivated');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const handleReactivate = async (user) => {
        try {
            await api.put(`/api/users/${user.id}/activate`);
            toast.success('User reactivated');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reactivate user');
        }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return;
        try {
            await api.delete(`/api/users/${user.id}/permanent`);
            toast.success('User permanently deleted');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
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

    const roleCounts = ROLES.reduce((acc, r) => {
        acc[r] = users.filter(u => u.role === r).length;
        return acc;
    }, {});

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '44px', height: '44px', border: '3px solid #e2e7f7',
                    borderTopColor: '#3b82f6', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#64748b', margin: '0', fontWeight: '600' }}>Loading users...</p>
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
                        background: '#dde3fb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <UsersIcon size={20} color="#2c3e9e" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0' }}>
                            Users
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0', fontWeight: '600' }}>
                            Manage roles, access and billing for all users
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                    { label: 'Admins', value: roleCounts.ADMIN, ...ROLE_STYLE.ADMIN },
                    { label: 'Makers', value: roleCounts.MAKER, ...ROLE_STYLE.MAKER },
                    { label: 'Checkers', value: roleCounts.CHECKER, ...ROLE_STYLE.CHECKER },
                    { label: 'Approvers', value: roleCounts.APPROVER, ...ROLE_STYLE.APPROVER },
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
                            <ShieldCheck size={18} color={s.color} />
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

            {/* Users List */}
            <div style={{ background: 'white', border: '1px solid #eceefb', borderRadius: '16px', padding: '8px' }}>
                {users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <UsersIcon size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                        <p style={{ color: '#64748b', margin: '0', fontWeight: '600' }}>No users found</p>
                    </div>
                ) : (
                    users.map((user, i) => {
                        const roleStyle = ROLE_STYLE[user.role] || ROLE_STYLE.MAKER;
                        return (
                            <div key={user.id} style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', padding: '16px 12px',
                                borderBottom: i < users.length - 1 ? '1px solid #f4f6fd' : 'none',
                                opacity: user.active ? 1 : 0.55,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: roleStyle.bg,
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontWeight: '800',
                                        color: roleStyle.color, fontSize: '16px', flexShrink: 0,
                                    }}>
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ color: '#1e293b', fontWeight: '800', fontSize: '14px', margin: '0 0 3px' }}>
                                            {user.name || user.email?.split('@')[0]}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '12px', margin: '0', fontWeight: '600' }}>
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    {/* Role dropdown */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setRoleMenuOpenFor(roleMenuOpenFor === user.id ? null : user.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '6px 12px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '800',
                                                background: roleStyle.bg, color: roleStyle.color,
                                                border: 'none', cursor: 'pointer',
                                            }}
                                        >
                                            {user.role}
                                            <ChevronDown size={12} />
                                        </button>
                                        {roleMenuOpenFor === user.id && (
                                            <div style={{
                                                position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                                                background: 'white', borderRadius: '12px',
                                                boxShadow: '0 8px 24px rgba(30,41,59,0.15)',
                                                padding: '6px', zIndex: 50, minWidth: '140px',
                                            }}>
                                                {ROLES.map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => handleRoleChange(user, r)}
                                                        style={{
                                                            display: 'block', width: '100%', textAlign: 'left',
                                                            padding: '8px 12px', borderRadius: '8px',
                                                            background: r === user.role ? '#f4f6fd' : 'transparent',
                                                            border: 'none', cursor: 'pointer',
                                                            fontSize: '12px', fontWeight: '700',
                                                            color: r === user.role ? '#2c3e9e' : '#475569',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#f4f6fd'}
                                                        onMouseLeave={e => { if (r !== user.role) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Active/Inactive badge */}
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px',
                                        fontSize: '11px', fontWeight: '800',
                                        background: user.active ? '#bce8cb' : '#f7b8c4',
                                        color: user.active ? '#1c6b3b' : '#a31f3c',
                                    }}>
                                        {user.active ? 'Active' : 'Inactive'}
                                    </span>

                                    {/* Top Up */}
                                    <button
                                        onClick={() => setTopUpModal(user)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 14px', borderRadius: '9px',
                                            background: '#d9f2e0', border: 'none',
                                            color: '#1c6b3b', cursor: 'pointer',
                                            fontSize: '12px', fontWeight: '700'
                                        }}
                                    >
                                        <CreditCard size={13} /> Top Up
                                    </button>

                                    {/* Activate / Deactivate */}
                                    {user.active ? (
                                        <button
                                            onClick={() => handleDeactivate(user)}
                                            title="Deactivate"
                                            style={{
                                                width: '34px', height: '34px', borderRadius: '9px',
                                                background: '#fdedc4', border: 'none',
                                                color: '#8a5d0a', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <UserX size={15} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReactivate(user)}
                                            title="Reactivate"
                                            style={{
                                                width: '34px', height: '34px', borderRadius: '9px',
                                                background: '#d9f2e0', border: 'none',
                                                color: '#1c6b3b', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <UserCheck size={15} />
                                        </button>
                                    )}

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(user)}
                                        title="Delete permanently"
                                        style={{
                                            width: '34px', height: '34px', borderRadius: '9px',
                                            background: '#fde3e8', border: 'none',
                                            color: '#d44d6a', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Top Up Modal */}
            {topUpModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(30,41,59,0.5)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: '#eaf6fd',
                        borderRadius: '20px', padding: '32px',
                        width: '100%', maxWidth: '400px',
                        boxShadow: '0 25px 60px rgba(30,41,59,0.25)'
                    }}>
                        <h3 style={{ color: '#1e293b', fontWeight: '800', fontSize: '18px', margin: '0 0 6px' }}>
                            Top Up Credits
                        </h3>
                        <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 24px', fontWeight: '600' }}>
                            Adding credits for <strong style={{ color: '#1e293b' }}>{topUpModal.email}</strong>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                            {[50, 100, 200, 500].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setTopUpAmount(String(amt))}
                                    style={{
                                        padding: '10px', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: '800', cursor: 'pointer',
                                        background: topUpAmount === String(amt) ? '#5b2bb0' : 'white',
                                        border: 'none',
                                        color: topUpAmount === String(amt) ? 'white' : '#475569',
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
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '10px', fontSize: '16px',
                                    color: '#1e293b', outline: 'none',
                                    fontFamily: 'inherit', boxSizing: 'border-box',
                                    fontWeight: '800'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setTopUpModal(null); setTopUpAmount(''); }}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: 'white',
                                        border: 'none',
                                        color: '#475569', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: '700', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        flex: 1, padding: '12px',
                                        background: '#5b2bb0',
                                        border: 'none', color: 'white', borderRadius: '10px',
                                        fontSize: '14px', fontWeight: '800', cursor: 'pointer',
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