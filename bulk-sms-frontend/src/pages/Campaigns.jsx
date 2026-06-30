import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Megaphone, Plus, Send, Clock, CheckCircle,
    XCircle, Trash2, Edit3, X,
    Calendar, FileText, Eye
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT:            { bg: '#e7e8f2', color: '#454a63', label: 'Draft' },
    PENDING_APPROVAL: { bg: '#fbe19a', color: '#8a5d0a', label: 'Pending' },
    APPROVED:         { bg: '#c7d2f9', color: '#2c3e9e', label: 'Approved' },
    SCHEDULED:        { bg: '#a9ddf0', color: '#0d5f80', label: 'Scheduled' },
    SENDING:          { bg: '#e1d4fa', color: '#5b2bb0', label: 'Sending' },
    SENT:             { bg: '#bce8cb', color: '#1c6b3b', label: 'Sent' },
    FAILED:           { bg: '#f7b8c4', color: '#a31f3c', label: 'Failed' },
    REJECTED:         { bg: '#f7b8c4', color: '#a31f3c', label: 'Rejected' },
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

    const statCards = [
        { label: 'Total', value: campaigns.length, icon: Megaphone, bg: '#aebcf5', color: '#1f2f8a' },
        { label: 'Sent', value: campaigns.filter(c => c.status === 'SENT').length, icon: Send, bg: '#93dba9', color: '#125a2c' },
        { label: 'Pending', value: campaigns.filter(c => c.status === 'PENDING_APPROVAL').length, icon: Clock, bg: '#f7d36b', color: '#704800' },
        { label: 'Draft', value: campaigns.filter(c => c.status === 'DRAFT').length, icon: FileText, bg: '#a9ddf0', color: '#0d5f80' },
        { label: 'Failed', value: campaigns.filter(c => c.status === 'FAILED').length, icon: XCircle, bg: '#f193a6', color: '#7a1530' },
    ];

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: 'white',
        border: '1.5px solid #e2e7f7',
        borderRadius: '10px', fontSize: '14px',
        color: '#1e293b', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
        fontWeight: '600',
    };

    const labelStyle = {
        display: 'block', fontSize: '11px', fontWeight: '800',
        color: '#64748b', marginBottom: '6px', textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const btnPrimary = {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
        fontWeight: '800', cursor: 'pointer', border: 'none',
        background: '#3b82f6',
        color: 'white',
    };

    return (
        <div style={{ maxWidth: '1100px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
                        Campaigns
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                        Create and manage your SMS &amp; email campaigns
                    </p>
                </div>
                <button onClick={openCreate} style={btnPrimary}>
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {statCards.map((card) => (
                    <div key={card.label} style={{
                        background: card.bg,
                        borderRadius: '16px', padding: '18px',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-22px', right: '-22px',
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.3)',
                        }} />
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.55)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '12px', position: 'relative',
                        }}>
                            <card.icon size={18} color={card.color} />
                        </div>
                        <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '800', margin: '0 0 2px', lineHeight: 1, position: 'relative' }}>
                            {card.value}
                        </p>
                        <p style={{ color: card.color, fontSize: '12px', margin: '0', fontWeight: '800', position: 'relative' }}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Campaign List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
                <div style={{
                    background: 'white',
                    border: '1px solid #eceefb',
                    borderRadius: '20px', padding: '80px 40px', textAlign: 'center'
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: '#dde3fb', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Megaphone size={32} color="#2c3e9e" />
                    </div>
                    <h3 style={{ color: '#1e293b', fontWeight: '800', fontSize: '18px', margin: '0 0 8px' }}>
                        No campaigns yet
                    </h3>
                    <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '14px', fontWeight: '600' }}>
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
                                    background: 'white',
                                    border: '1px solid #eceefb',
                                    borderRadius: '16px', padding: '20px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,135,231,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                    {/* Left */}
                                    <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                            background: campaign.type === 'EMAIL' ? '#dde3fb' : '#e1d4fa',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {campaign.type === 'EMAIL'
                                                ? <Send size={20} color="#2c3e9e" />
                                                : <Megaphone size={20} color="#5b2bb0" />
                                            }
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
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
                                            <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                                {campaign.message}
                                            </p>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                <span style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                                    <Calendar size={11} />
                                                    {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                                                </span>
                                                {campaign.scheduledAt && (
                                                    <span style={{ color: '#0d5f80', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                                        <Clock size={11} />
                                                        Scheduled: {new Date(campaign.scheduledAt).toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                                {campaign.sentAt && (
                                                    <span style={{ color: '#1c6b3b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
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
                                                    background: '#f1f2fa',
                                                    border: 'none',
                                                    color: '#475569', cursor: 'pointer', fontSize: '12px',
                                                    fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <Edit3 size={13} /> Edit
                                                </button>
                                                <button onClick={() => handleSubmitForApproval(campaign.id)} style={{
                                                    padding: '8px 14px', borderRadius: '9px',
                                                    background: '#dde3fb',
                                                    border: 'none',
                                                    color: '#2c3e9e', cursor: 'pointer', fontSize: '12px',
                                                    fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <Send size={13} /> Submit
                                                </button>
                                                <button onClick={() => handleDelete(campaign.id)} style={{
                                                    padding: '8px', borderRadius: '9px',
                                                    background: '#fde3e8',
                                                    border: 'none',
                                                    color: '#d44d6a', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center'
                                                }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                        {campaign.status === 'SENT' && (
                                            <button onClick={() => setSelectedCampaign(campaign)} style={{
                                                padding: '8px 14px', borderRadius: '9px',
                                                background: '#d9f2e0',
                                                border: 'none',
                                                color: '#1c6b3b', cursor: 'pointer', fontSize: '12px',
                                                fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
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
                    background: 'rgba(30,41,59,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: 'lightgrey',
                        borderRadius: '22px', padding: '32px',
                        width: '100%', maxWidth: '520px',
                        boxShadow: '0 30px 70px rgba(30,41,59,0.25)',
                    }}>
                        <div style={{
                            height: '4px', borderRadius: '2px',
                            background: 'linear-gradient(90deg,#3b82f6,#7c3aed)',
                            marginBottom: '24px',
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
                                    {editCampaign ? 'Edit Campaign' : 'New Campaign'}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0', fontWeight: '600' }}>
                                    {editCampaign ? 'Update your draft campaign' : 'Campaign starts as Draft'}
                                </p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} style={{
                                background: '#f1f2fa', border: 'none',
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
                                            <option value="EMAIL">Email</option>
                                            <option value="SMS">SMS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Contact Group *</label>
                                        <select value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })}
                                                required style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="">Select group</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>
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
                                    <p style={{ color: '#94a3b8', fontSize: '11px', margin: '4px 0 0', textAlign: 'right', fontWeight: '600' }}>
                                        {form.message.length} characters
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>Schedule At (optional)</label>
                                        <input type="datetime-local" value={form.scheduledAt}
                                               onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                                               style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Timezone</label>
                                        <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="Asia/Dubai">GST (Dubai)</option>
                                            <option value="America/New_York">EST (New York)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{
                                    background: '#eef1fd', border: 'none',
                                    borderRadius: '10px', padding: '12px 14px',
                                    display: 'flex', gap: '10px', alignItems: 'flex-start'
                                }}>
                                    <FileText size={15} color="#2c3e9e" style={{ flexShrink: 0, marginTop: '1px' }} />
                                    <p style={{ color: '#2c3e9e', fontSize: '12px', margin: '0', lineHeight: '1.5', fontWeight: '600' }}>
                                        Campaign will be saved as <strong>Draft</strong>. Submit it for admin approval to send.
                                        {form.scheduledAt && ' Scheduled campaigns fire automatically at the set time.'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{
                                        padding: '10px 20px', borderRadius: '10px',
                                        background: '#f1f2fa',
                                        border: 'none',
                                        color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
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