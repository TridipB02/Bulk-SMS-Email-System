import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Megaphone, Plus, Send, Clock, CheckCircle,
    XCircle, Trash2, Edit3, X,
    Calendar, Users, FileText, Eye, BarChart3
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT:            { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8',  label: 'Draft' },
    PENDING_APPROVAL: { bg: 'rgba(234,179,8,0.15)',   color: '#fbbf24',  label: 'Pending' },
    APPROVED:         { bg: 'rgba(37,99,235,0.15)',   color: '#60a5fa',  label: 'Approved' },
    SCHEDULED:        { bg: 'rgba(14,165,233,0.15)',  color: '#38bdf8',  label: 'Scheduled' },
    SENDING:          { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc',  label: 'Sending' },
    SENT:             { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',  label: 'Sent' },
    FAILED:           { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  label: 'Failed' },
    REJECTED:         { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  label: 'Rejected' },
};

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCampaign, setEditCampaign] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [form, setForm] = useState({
        name: '', message: '', groupId: '',
        type: 'EMAIL', scheduledAt: '', timezone: 'Asia/Kolkata'
    });

    useEffect(() => { fetchCampaigns(); fetchGroups(); }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/campaigns/my');
            setCampaigns(res.data);
        } catch { toast.error('Failed to load campaigns'); }
        finally { setLoading(false); }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/api/contacts/groups');
            setGroups(res.data);
        } catch {}
    };

    const resetForm = () => {
        setForm({ name: '', message: '', groupId: '', type: 'EMAIL', scheduledAt: '', timezone: 'Asia/Kolkata' });
        setEditCampaign(null);
    };

    const openCreate = () => { resetForm(); setShowModal(true); };

    const openEdit = (campaign) => {
        setEditCampaign(campaign);
        setForm({
            name: campaign.name,
            message: campaign.message,
            groupId: campaign.groupId,
            type: campaign.type,
            scheduledAt: campaign.scheduledAt ? campaign.scheduledAt.slice(0, 16) : '',
            timezone: campaign.timezone || 'Asia/Kolkata'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form, groupId: parseInt(form.groupId), scheduledAt: form.scheduledAt || null };
            if (editCampaign) {
                await api.put(`/api/campaigns/${editCampaign.id}`, payload);
                toast.success('Campaign updated!');
            } else {
                await api.post('/api/campaigns', payload);
                toast.success('Campaign created as Draft!');
            }
            setShowModal(false);
            resetForm();
            fetchCampaigns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save campaign');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitForApproval = async (id) => {
        try {
            await api.put(`/api/campaigns/${id}/submit`);
            toast.success('Submitted for approval!');
            fetchCampaigns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this draft campaign?')) return;
        try {
            await api.delete(`/api/campaigns/${id}`);
            toast.success('Campaign deleted');
            fetchCampaigns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    // Stat cards — each with its own gradient like Dashboard
    const statCards = [
        {
            label: 'Total',
            value: campaigns.length,
            icon: Megaphone,
            gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            circleBg: '#a78bfa',
        },
        {
            label: 'Sent',
            value: campaigns.filter(c => c.status === 'SENT').length,
            icon: Send,
            gradient: 'linear-gradient(135deg, #064e3b, #059669)',
            circleBg: '#6ee7b7',
        },
        {
            label: 'Pending',
            value: campaigns.filter(c => c.status === 'PENDING_APPROVAL').length,
            icon: Clock,
            gradient: 'linear-gradient(135deg, #78350f, #d97706)',
            circleBg: '#fcd34d',
        },
        {
            label: 'Draft',
            value: campaigns.filter(c => c.status === 'DRAFT').length,
            icon: FileText,
            gradient: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            circleBg: '#93c5fd',
        },
        {
            label: 'Failed',
            value: campaigns.filter(c => c.status === 'FAILED').length,
            icon: XCircle,
            gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
            circleBg: '#fca5a5',
        },
    ];

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px', fontSize: '14px',
        color: 'white', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block', fontSize: '12px', fontWeight: '600',
        color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const btnPrimary = {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer', border: 'none',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.35)'
    };

    return (
        <div style={{ maxWidth: '1100px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
                        Campaigns
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0', fontWeight: '500' }}>
                        Create and manage your SMS &amp; email campaigns
                    </p>
                </div>
                <button onClick={openCreate} style={btnPrimary}>
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            {/* Stat Cards — 5 colored gradient cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {statCards.map((card) => (
                    <div key={card.label} style={{
                        background: card.gradient,
                        borderRadius: '16px', padding: '18px',
                        position: 'relative', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
                    }}>
                        {/* Decorative circle */}
                        <div style={{
                            position: 'absolute', top: '-22px', right: '-22px',
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: card.circleBg, opacity: 0.15,
                        }} />
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '12px',
                        }}>
                            <card.icon size={18} color="white" />
                        </div>
                        <p style={{ color: 'white', fontSize: '30px', fontWeight: '800', margin: '0 0 3px', lineHeight: 1, letterSpacing: '-1px' }}>
                            {card.value}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '0', fontWeight: '600' }}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Campaign List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px', padding: '80px 40px', textAlign: 'center'
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(124,58,237,0.15)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Megaphone size={32} color="#a78bfa" />
                    </div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', margin: '0 0 8px' }}>
                        No campaigns yet
                    </h3>
                    <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: '14px', fontWeight: '500' }}>
                        Create your first campaign to start sending messages
                    </p>
                    <button onClick={openCreate} style={btnPrimary}>
                        <Plus size={16} /> Create First Campaign
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {campaigns.map(campaign => {
                        const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.DRAFT;
                        return (
                            <div
                                key={campaign.id}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px', padding: '20px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                    {/* Left */}
                                    <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                            background: campaign.type === 'EMAIL'
                                                ? 'rgba(37,99,235,0.2)' : 'rgba(124,58,237,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {campaign.type === 'EMAIL'
                                                ? <Send size={20} color="#60a5fa" />
                                                : <Megaphone size={20} color="#a78bfa" />
                                            }
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
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
                                                    background: 'rgba(255,255,255,0.07)', color: '#94a3b8'
                                                }}>
                                                    {campaign.type}
                                                </span>
                                            </div>
                                            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '400' }}>
                                                {campaign.message}
                                            </p>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                <span style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={11} />
                                                    {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                                                </span>
                                                {campaign.scheduledAt && (
                                                    <span style={{ color: '#38bdf8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={11} />
                                                        Scheduled: {new Date(campaign.scheduledAt).toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                                {campaign.sentAt && (
                                                    <span style={{ color: '#4ade80', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <CheckCircle size={11} />
                                                        Sent: {new Date(campaign.sentAt).toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                                        {campaign.status === 'DRAFT' && (
                                            <>
                                                <button onClick={() => openEdit(campaign)} style={{
                                                    padding: '8px 14px', borderRadius: '9px',
                                                    background: 'rgba(255,255,255,0.07)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#94a3b8', cursor: 'pointer', fontSize: '12px',
                                                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <Edit3 size={13} /> Edit
                                                </button>
                                                <button onClick={() => handleSubmitForApproval(campaign.id)} style={{
                                                    padding: '8px 14px', borderRadius: '9px',
                                                    background: 'rgba(37,99,235,0.2)',
                                                    border: '1px solid rgba(37,99,235,0.35)',
                                                    color: '#60a5fa', cursor: 'pointer', fontSize: '12px',
                                                    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <Send size={13} /> Submit
                                                </button>
                                                <button onClick={() => handleDelete(campaign.id)} style={{
                                                    padding: '8px', borderRadius: '9px',
                                                    background: 'rgba(239,68,68,0.1)',
                                                    border: '1px solid rgba(239,68,68,0.2)',
                                                    color: '#f87171', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center'
                                                }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                        {campaign.status === 'SENT' && (
                                            <button onClick={() => setSelectedCampaign(campaign)} style={{
                                                padding: '8px 14px', borderRadius: '9px',
                                                background: 'rgba(34,197,94,0.1)',
                                                border: '1px solid rgba(34,197,94,0.2)',
                                                color: '#4ade80', cursor: 'pointer', fontSize: '12px',
                                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <Eye size={13} /> View Report
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg,#0f172a,#1a2744)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '22px', padding: '32px',
                        width: '100%', maxWidth: '520px',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
                    }}>
                        {/* Accent bar */}
                        <div style={{
                            height: '3px', borderRadius: '2px',
                            background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
                            marginBottom: '24px',
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>
                                    {editCampaign ? 'Edit Campaign' : 'New Campaign'}
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0', fontWeight: '500' }}>
                                    {editCampaign ? 'Update your draft campaign' : 'Campaign starts as Draft'}
                                </p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} style={{
                                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', width: '36px', height: '36px',
                                borderRadius: '10px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#64748b'
                            }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div>
                                    <label style={labelStyle}>Campaign Name *</label>
                                    <input type="text" required placeholder="e.g. Tax Reminder June 2026"
                                           value={form.name}
                                           onChange={e => setForm({ ...form, name: e.target.value })}
                                           style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>Type *</label>
                                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="EMAIL" style={{ background: '#0f172a' }}>Email</option>
                                            <option value="SMS" style={{ background: '#0f172a' }}>SMS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Contact Group *</label>
                                        <select value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })}
                                                required style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="" style={{ background: '#0f172a' }}>Select group</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id} style={{ background: '#0f172a' }}>
                                                    {g.name} ({g.contactCount})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Message *</label>
                                    <textarea required placeholder="Type your message here..."
                                              value={form.message}
                                              onChange={e => setForm({ ...form, message: e.target.value })}
                                              rows={4}
                                              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
                                    <p style={{ color: '#475569', fontSize: '11px', margin: '4px 0 0', textAlign: 'right' }}>
                                        {form.message.length} characters
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>Schedule At (optional)</label>
                                        <input type="datetime-local" value={form.scheduledAt}
                                               onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                                               style={{ ...inputStyle, colorScheme: 'dark' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Timezone</label>
                                        <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="Asia/Kolkata" style={{ background: '#0f172a' }}>IST (Asia/Kolkata)</option>
                                            <option value="UTC" style={{ background: '#0f172a' }}>UTC</option>
                                            <option value="Asia/Dubai" style={{ background: '#0f172a' }}>GST (Dubai)</option>
                                            <option value="America/New_York" style={{ background: '#0f172a' }}>EST (New York)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                                    borderRadius: '10px', padding: '12px 14px',
                                    display: 'flex', gap: '10px', alignItems: 'flex-start'
                                }}>
                                    <FileText size={15} color="#60a5fa" style={{ flexShrink: 0, marginTop: '1px' }} />
                                    <p style={{ color: '#93c5fd', fontSize: '12px', margin: '0', lineHeight: '1.5' }}>
                                        Campaign will be saved as <strong>Draft</strong>. Submit it for admin approval to send.
                                        {form.scheduledAt && ' Scheduled campaigns fire automatically at the set time.'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{
                                        padding: '10px 20px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#94a3b8', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                    }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting} style={btnPrimary}>
                                        {submitting ? 'Saving...' : editCampaign ? 'Update Campaign' : 'Save as Draft'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}