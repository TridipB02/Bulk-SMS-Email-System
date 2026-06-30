import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Users, Upload, Search, Trash2,
    X, Phone, Mail, User, FileText, UserPlus, CheckSquare, Square, Send
} from 'lucide-react';

const GROUP_PALETTE = [
    { bg: '#c7d2f9', color: '#2c3e9e' }, // blue
    { bg: '#bce8cb', color: '#1c6b3b' }, // green
    { bg: '#fbe19a', color: '#8a5d0a' }, // amber
    { bg: '#e1d4fa', color: '#5b2bb0' }, // purple
    { bg: '#a9ddf0', color: '#0d5f80' }, // cyan
    { bg: '#f7d0e0', color: '#9c2c61' }, // pink
    { bg: '#cdebd6', color: '#1a7a44' }, // mint
    { bg: '#fcd9b8', color: '#9a4b0a' }, // orange
    { bg: '#d4e0fc', color: '#1f4ba0' }, // light blue
];

// stable color per group name using a stronger hash (djb2-style)
function getGroupPalette(groupName) {
    if (!groupName) return GROUP_PALETTE[0];
    let hash = 5381;
    for (let i = 0; i < groupName.length; i++) {
        hash = ((hash << 5) + hash) + groupName.charCodeAt(i);
        hash = hash & hash; // keep it 32-bit
    }
    const idx = Math.abs(hash) % GROUP_PALETTE.length;
    return GROUP_PALETTE[idx];
}

export default function Contacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvDragging, setCsvDragging] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', phoneNumber: '', email: '', groupName: '' });
    const [selectedIds, setSelectedIds] = useState(new Set());
    const fileRef = useRef();

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const groupsRes = await api.get('/api/contacts/groups');
            setGroups(groupsRes.data);
            const allContacts = [];
            for (const g of groupsRes.data) {
                const res = await api.get(`/api/contacts/groups/${g.id}/contacts`);
                res.data.forEach(c => allContacts.push({ ...c, groupName: g.name, groupId: g.id }));
            }
            setContacts(allContacts);
        } catch {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(c =>
        !searchKeyword ||
        c.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.phoneNumber?.includes(searchKeyword)
    );

    const handleAddContact = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let group = groups.find(g => g.name.toLowerCase() === contactForm.groupName.toLowerCase());
            if (!group && contactForm.groupName) {
                const res = await api.post('/api/contacts/groups', { name: contactForm.groupName, description: '' });
                group = res.data;
            }
            if (!group) { toast.error('Please enter a group name'); setSubmitting(false); return; }
            await api.post(`/api/contacts/groups/${group.id}/contacts`, {
                name: contactForm.name,
                phoneNumber: contactForm.phoneNumber,
                email: contactForm.email,
            });
            toast.success('Contact saved!');
            setContactForm({ name: '', phoneNumber: '', email: '', groupName: '' });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (!confirm('Delete this contact?')) return;
        try {
            await api.delete(`/api/contacts/contacts/${contactId}`);
            toast.success('Contact deleted');
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(contactId);
                return next;
            });
            fetchAll();
        } catch { toast.error('Failed to delete contact'); }
    };

    const handleCsvUpload = async () => {
        if (!csvFile) { toast.error('Please select a CSV file first'); return; }
        if (groups.length === 0) { toast.error('Create a group first'); return; }
        const formData = new FormData();
        formData.append('file', csvFile);
        try {
            const res = await api.post(
                `/api/contacts/groups/${groups[0].id}/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            toast.success(res.data.message || 'Uploaded successfully');
            setCsvFile(null);
            fetchAll();
        } catch { toast.error('CSV upload failed'); }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setCsvDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) setCsvFile(file);
        else toast.error('Please drop a CSV file');
    };

    const toggleSelect = (contact) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(contact.id)) next.delete(contact.id);
            else next.add(contact.id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredContacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const goToCampaignWithSelection = () => {
        const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
        if (selectedContacts.length === 0) return;
        localStorage.setItem('pendingContactSelection', JSON.stringify(
            selectedContacts.map(c => ({ id: c.id, name: c.name, phoneNumber: c.phoneNumber, email: c.email }))
        ));
        toast.success(`${selectedContacts.length} contacts ready — choose a group name on the Campaigns page`);
        navigate('/campaigns');
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px 12px 42px',
        background: 'white',
        border: '1.5px solid #e2e7f7',
        borderRadius: '11px',
        fontSize: '14px',
        color: '#1e293b',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        fontWeight: '600',
    };

    const allSelected = filteredContacts.length > 0 && selectedIds.size === filteredContacts.length;

    return (
        <div style={{ maxWidth: '1200px' }}>

            {/* ── Top two panels ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* ── Add New Contact — Purple pastel ── */}
                <div style={{
                    background: '#b89bf2',
                    borderRadius: '18px', padding: '28px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
                    <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '11px',
                            background: 'rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <UserPlus size={19} color="#3a1d77" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2a124f', margin: '0' }}>
                                Add New Contact
                            </h3>
                            <p style={{ fontSize: '12px', color: '#3a1d77', margin: '2px 0 0', fontWeight: '700' }}>
                                Fill in the details below
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddContact} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="#9095c2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" required placeholder="Full Name"
                                       value={contactForm.name}
                                       onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                       style={inputStyle} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Phone size={15} color="#9095c2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" required placeholder="Mobile Number"
                                       value={contactForm.phoneNumber}
                                       onChange={e => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                                       style={inputStyle} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#9095c2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="email" placeholder="Email"
                                       value={contactForm.email}
                                       onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                       style={inputStyle} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Users size={15} color="#9095c2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" required placeholder="Group Category"
                                       value={contactForm.groupName}
                                       onChange={e => setContactForm({ ...contactForm, groupName: e.target.value })}
                                       style={inputStyle}
                                       list="groups-list" />
                                <datalist id="groups-list">
                                    {groups.map(g => <option key={g.id} value={g.name} />)}
                                </datalist>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} style={{
                            width: '100%', padding: '13px',
                            background: submitting ? '#9a7fdb' : '#6d3fd0',
                            color: 'white', border: 'none',
                            borderRadius: '12px', fontSize: '14px', fontWeight: '800',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                        }}
                                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#5b2bb0'; }}
                                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#6d3fd0'; }}
                        >
                            {submitting ? 'Saving...' : 'Save Contact'}
                        </button>
                    </form>
                </div>

                {/* ── Bulk Upload CSV — Green pastel ── */}
                <div style={{
                    background: '#93dba9',
                    borderRadius: '18px', padding: '28px',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
                    <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '11px',
                            background: 'rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Upload size={19} color="#0c3d1f" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#073016', margin: '0' }}>
                                Bulk Upload (CSV)
                            </h3>
                            <p style={{ fontSize: '12px', color: '#0c3d1f', margin: '2px 0 0', fontWeight: '700' }}>
                                Import multiple contacts at once
                            </p>
                        </div>
                    </div>

                    {/* Drop zone */}
                    <div
                        onClick={() => fileRef.current.click()}
                        onDragOver={e => { e.preventDefault(); setCsvDragging(true); }}
                        onDragLeave={() => setCsvDragging(false)}
                        onDrop={handleDrop}
                        style={{
                            flex: 1,
                            border: `2px dashed ${
                                csvDragging ? '#1c6b3b'
                                    : csvFile ? '#2f9b56'
                                        : 'rgba(255,255,255,0.6)'
                            }`,
                            borderRadius: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '32px 20px',
                            marginBottom: '20px',
                            background: 'rgba(255,255,255,0.3)',
                            transition: 'all 0.2s',
                            position: 'relative',
                        }}
                    >
                        <input type="file" accept=".csv" ref={fileRef}
                               onChange={e => setCsvFile(e.target.files[0])}
                               style={{ display: 'none' }} />
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: csvFile ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
                        }}>
                            <FileText size={24} color={csvFile ? '#1c6b3b' : '#125a2c'} />
                        </div>
                        {csvFile ? (
                            <>
                                <p style={{ color: '#0c3d1f', fontWeight: '800', fontSize: '14px', margin: '0 0 4px' }}>{csvFile.name}</p>
                                <p style={{ color: '#125a2c', fontSize: '12px', margin: '0', fontWeight: '700' }}>
                                    {(csvFile.size / 1024).toFixed(1)} KB — click to change
                                </p>
                            </>
                        ) : (
                            <>
                                <p style={{ color: '#0c3d1f', fontWeight: '800', fontSize: '14px', margin: '0 0 4px' }}>
                                    Click to browse or drag &amp; drop
                                </p>
                                <p style={{ color: '#125a2c', fontSize: '12px', margin: '0', fontWeight: '700' }}>
                                    Format: Name, Mobile, Email, Group
                                </p>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                        {csvFile && (
                            <button onClick={() => setCsvFile(null)} style={{
                                padding: '13px 16px', borderRadius: '12px',
                                background: '#f7b8c4',
                                border: 'none',
                                color: '#7a1530', cursor: 'pointer', fontSize: '13px', fontWeight: '800',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                <X size={14} /> Clear
                            </button>
                        )}
                        <button onClick={handleCsvUpload} style={{
                            flex: 1, padding: '13px',
                            background: '#1c6b3b',
                            color: 'white', border: 'none',
                            borderRadius: '12px', fontSize: '14px', fontWeight: '800',
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                                onMouseEnter={e => e.currentTarget.style.background = '#125a2c'}
                                onMouseLeave={e => e.currentTarget.style.background = '#1c6b3b'}
                        >
                            Upload Contacts File
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Selection action bar ── */}
            {selectedIds.size > 0 && (
                <div style={{
                    background: '#1e293b',
                    borderRadius: '14px', padding: '14px 20px',
                    marginBottom: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CheckSquare size={16} color="white" />
                        </div>
                        <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: '0' }}>
                            {selectedIds.size} contact{selectedIds.size !== 1 ? 's' : ''} selected
                            {' '}<span style={{ color: '#94a3b8', fontWeight: '600' }}>(across {new Set(contacts.filter(c => selectedIds.has(c.id)).map(c => c.groupId)).size} group{new Set(contacts.filter(c => selectedIds.has(c.id)).map(c => c.groupId)).size !== 1 ? 's' : ''})</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setSelectedIds(new Set())} style={{
                            padding: '9px 16px', borderRadius: '9px',
                            background: 'rgba(255,255,255,0.1)', border: 'none',
                            color: '#cbd5e1', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                        }}>
                            Clear
                        </button>
                        <button onClick={goToCampaignWithSelection} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '9px 18px', borderRadius: '9px',
                            background: '#3b82f6', border: 'none',
                            color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                        }}>
                            <Send size={14} /> Use in Campaign
                        </button>
                    </div>
                </div>
            )}

            {/* ── Directory Table — Blue pastel ── */}
            <div style={{
                background: '#a9ddf0',
                borderRadius: '18px', overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />

                {/* Table header */}
                <div style={{
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '11px',
                            background: 'rgba(255,255,255,0.55)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Users size={18} color="#0d5f80" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#063f57', margin: '0' }}>
                                Directory
                            </h3>
                            <p style={{ fontSize: '12px', color: '#0d5f80', margin: '2px 0 0', fontWeight: '700' }}>
                                {loading ? 'Loading...' : `${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={14} color="#0d5f80" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text" placeholder="Search directory"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 14px 9px 34px',
                                background: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '13px',
                                color: '#1e293b',
                                outline: 'none',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                fontWeight: '600',
                            }}
                        />
                        {searchKeyword && (
                            <button onClick={() => setSearchKeyword('')} style={{
                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0',
                            }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ background: 'white', margin: '0 12px 12px', borderRadius: '14px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', fontWeight: '700' }}>
                            Loading contacts...
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '18px',
                                background: '#a9ddf0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                            }}>
                                <Users size={28} color="#0d5f80" />
                            </div>
                            <p style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>No contacts found</p>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: '0', fontWeight: '600' }}>
                                Add some contacts above to see them here
                            </p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ background: '#f4f6fd' }}>
                                <th style={{ padding: '12px 16px', width: '40px', borderBottom: '1px solid #eef0f9' }}>
                                    <button onClick={toggleSelectAll} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: allSelected ? '#3b82f6' : '#94a3b8',
                                        display: 'flex', alignItems: 'center',
                                    }}>
                                        {allSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                                    </button>
                                </th>
                                {['Name', 'Mobile', 'Email', 'Group', 'Actions'].map((h, i) => (
                                    <th key={h} style={{
                                        padding: '12px 20px', textAlign: i === 4 ? 'right' : 'left',
                                        fontSize: '10px', fontWeight: '800',
                                        color: '#64748b',
                                        textTransform: 'uppercase', letterSpacing: '0.8px',
                                        borderBottom: '1px solid #eef0f9',
                                    }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredContacts.map((contact) => {
                                const pal = getGroupPalette(contact.groupName);
                                const isSelected = selectedIds.has(contact.id);
                                return (
                                    <tr key={contact.id}
                                        style={{
                                            borderBottom: '1px solid #f4f6fd',
                                            transition: 'background 0.15s',
                                            background: isSelected ? '#eef4ff' : 'transparent',
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafe'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <td style={{ padding: '13px 16px' }}>
                                            <button onClick={() => toggleSelect(contact)} style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: isSelected ? '#3b82f6' : '#cbd5e1',
                                                display: 'flex', alignItems: 'center',
                                            }}>
                                                {isSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                                            </button>
                                        </td>
                                        <td style={{ padding: '13px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: pal.bg, color: pal.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '800', fontSize: '13px', flexShrink: 0,
                                                }}>
                                                    {contact.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>
                                                    {contact.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                                <Phone size={13} color="#94a3b8" />
                                                <span style={{ color: '#374151', fontSize: '13px', fontWeight: '600' }}>{contact.phoneNumber}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                                <Mail size={13} color="#94a3b8" />
                                                <span style={{ color: '#374151', fontSize: '13px', fontWeight: '600' }}>{contact.email || '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 20px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                                background: pal.bg, color: pal.color,
                                            }}>
                                                {contact.groupName}
                                            </span>
                                        </td>
                                        <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDeleteContact(contact.id)}
                                                style={{
                                                    background: '#f7b8c4',
                                                    border: 'none',
                                                    color: '#7a1530', padding: '6px 14px',
                                                    borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f193a6'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f7b8c4'}
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}