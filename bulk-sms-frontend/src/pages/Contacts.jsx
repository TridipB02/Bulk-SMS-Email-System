import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Users, Upload, Search, Trash2,
    X, Phone, Mail, User, FileText, UserPlus
} from 'lucide-react';

export default function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvDragging, setCsvDragging] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', phoneNumber: '', email: '', groupName: '' });
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

    const palettes = [
        { bg: 'rgba(124,58,237,0.2)',  color: '#a78bfa' },
        { bg: 'rgba(5,150,105,0.2)',   color: '#6ee7b7' },
        { bg: 'rgba(219,39,119,0.2)',  color: '#f9a8d4' },
        { bg: 'rgba(217,119,6,0.2)',   color: '#fcd34d' },
        { bg: 'rgba(14,165,233,0.2)',  color: '#7dd3fc' },
        { bg: 'rgba(220,38,38,0.2)',   color: '#fca5a5' },
    ];
    const getPal = (i) => palettes[i % palettes.length];

    return (
        <div style={{ maxWidth: '1200px' }}>

            {/* ── Top two panels ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* ── Add New Contact — Purple ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #2e1065, #4c1d95, #6d28d9)',
                    borderRadius: '18px', padding: '28px',
                    border: '1px solid rgba(167,139,250,0.2)',
                    boxShadow: '0 8px 28px rgba(109,40,217,0.3)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Decorative circles */}
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: '#a78bfa', opacity: 0.1 }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                    {/* Panel title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '11px',
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <UserPlus size={19} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: '0' }}>
                                Add New Contact
                            </h3>
                            <p style={{ fontSize: '12px', color: 'rgba(196,181,253,0.8)', margin: '2px 0 0', fontWeight: '500' }}>
                                Fill in the details below
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddContact}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" required placeholder="Full Name"
                                       value={contactForm.name}
                                       onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                       style={purpleInput} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Phone size={15} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" required placeholder="Mobile Number"
                                       value={contactForm.phoneNumber}
                                       onChange={e => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                                       style={purpleInput} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="email" placeholder="Email"
                                       value={contactForm.email}
                                       onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                       style={purpleInput} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Users size={15} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" required placeholder="Group Category"
                                       value={contactForm.groupName}
                                       onChange={e => setContactForm({ ...contactForm, groupName: e.target.value })}
                                       style={purpleInput}
                                       list="groups-list" />
                                <datalist id="groups-list">
                                    {groups.map(g => <option key={g.id} value={g.name} />)}
                                </datalist>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} style={{
                            width: '100%', padding: '13px',
                            background: submitting ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            backdropFilter: 'blur(10px)', transition: 'all 0.2s',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        }}
                                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
                                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                        >
                            {submitting ? 'Saving...' : 'Save Contact'}
                        </button>
                    </form>
                </div>

                {/* ── Bulk Upload CSV — Green ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #022c22, #064e3b, #065f46)',
                    borderRadius: '18px', padding: '28px',
                    border: '1px solid rgba(110,231,183,0.2)',
                    boxShadow: '0 8px 28px rgba(5,150,105,0.25)',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: '#6ee7b7', opacity: 0.1 }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                    {/* Panel title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '11px',
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Upload size={19} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: '0' }}>
                                Bulk Upload (CSV)
                            </h3>
                            <p style={{ fontSize: '12px', color: 'rgba(110,231,183,0.8)', margin: '2px 0 0', fontWeight: '500' }}>
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
                                csvDragging ? '#6ee7b7'
                                    : csvFile ? '#34d399'
                                        : 'rgba(255,255,255,0.2)'
                            }`,

                            borderRadius: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '32px 20px',
                            marginBottom: '20px',

                            background: csvDragging
                                ? '#0b1f17'          // dark greenish black when dragging
                                : csvFile
                                    ? '#0b1412'      // slightly green-tinted dark when file selected
                                    : '#0b0b0b',     // solid black default

                            transition: 'all 0.2s',
                        }}
                    >
                        <input type="file" accept=".csv" ref={fileRef}
                               onChange={e => setCsvFile(e.target.files[0])}
                               style={{ display: 'none' }} />
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: csvFile ? 'rgba(110,231,183,0.18)' : 'rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
                        }}>
                            <FileText size={24} color={csvFile ? '#6ee7b7' : 'rgba(255,255,255,0.4)'} />
                        </div>
                        {csvFile ? (
                            <>
                                <p style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '14px', margin: '0 0 4px' }}>{csvFile.name}</p>
                                <p style={{ color: 'rgba(110,231,183,0.6)', fontSize: '12px', margin: '0', fontWeight: '500' }}>
                                    {(csvFile.size / 1024).toFixed(1)} KB — click to change
                                </p>
                            </>
                        ) : (
                            <>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: '14px', margin: '0 0 4px' }}>
                                    Click to browse or drag &amp; drop
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0', fontWeight: '500' }}>
                                    Format: Name, Mobile, Email, Group
                                </p>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {csvFile && (
                            <button onClick={() => setCsvFile(null)} style={{
                                padding: '13px 16px', borderRadius: '12px',
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                color: '#fca5a5', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                <X size={14} /> Clear
                            </button>
                        )}
                        <button onClick={handleCsvUpload} style={{
                            flex: 1, padding: '13px',
                            background: 'rgba(255,255,255,0.18)',
                            color: 'white', border: '1px solid rgba(255,255,255,0.28)',
                            borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                            cursor: 'pointer', backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.26)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                        >
                            Upload Contacts File
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Directory Table — Cyan/Sky ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0c2340, #0c3d5e, #0e4f7a)',
                borderRadius: '18px', overflow: 'hidden',
                border: '1px solid rgba(125,211,252,0.15)',
                boxShadow: '0 8px 28px rgba(14,165,233,0.2)',
                position: 'relative',
            }}>
                {/* Decorative */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: '#7dd3fc', opacity: 0.06, pointerEvents: 'none' }} />

                {/* Table header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(125,211,252,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '11px',
                            background: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Users size={18} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0' }}>
                                Directory
                            </h3>
                            <p style={{ fontSize: '12px', color: 'rgba(125,211,252,0.7)', margin: '2px 0 0', fontWeight: '500' }}>
                                {loading ? 'Loading...' : `${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={14} color="rgba(125,211,252,0.5)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text" placeholder="Search directory"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 14px 9px 34px',
                                background: '#0b0b0b',
                                border: '1.5px solid rgba(255,255,255,0.12)',
                                borderRadius: '10px',
                                fontSize: '13px',
                                color: 'white',
                                outline: 'none',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                        />
                        {searchKeyword && (
                            <button onClick={() => setSearchKeyword('')} style={{
                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(125,211,252,0.5)', padding: '0',
                            }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(125,211,252,0.5)', fontWeight: '500' }}>
                        Loading contacts...
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'rgba(14,165,233,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                            <Users size={28} color="#7dd3fc" />
                        </div>
                        <p style={{ fontWeight: '600', color: 'white', margin: '0 0 6px' }}>No contacts found</p>
                        <p style={{ color: 'rgba(125,211,252,0.6)', fontSize: '13px', margin: '0', fontWeight: '500' }}>
                            Add some contacts above to see them here
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                            {['Name', 'Mobile', 'Email', 'Group', 'Actions'].map((h, i) => (
                                <th key={h} style={{
                                    padding: '12px 20px', textAlign: i === 4 ? 'right' : 'left',
                                    fontSize: '10px', fontWeight: '700',
                                    color: 'rgba(125,211,252,0.6)',
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                    borderBottom: '1px solid rgba(125,211,252,0.1)',
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredContacts.map((contact, i) => {
                            const pal = getPal(i);
                            return (
                                <tr key={contact.id}
                                    style={{ borderBottom: '1px solid rgba(125,211,252,0.06)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '13px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: pal.bg, color: pal.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '700', fontSize: '13px', flexShrink: 0,
                                            }}>
                                                {contact.name?.[0]?.toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>
                                                    {contact.name}
                                                </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                            <Phone size={13} color="rgba(125,211,252,0.4)" />
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500' }}>{contact.phoneNumber}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                            <Mail size={13} color="rgba(125,211,252,0.4)" />
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500' }}>{contact.email || '—'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                background: pal.bg, color: pal.color,
                                            }}>
                                                {contact.groupName}
                                            </span>
                                    </td>
                                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDeleteContact(contact.id)}
                                            style={{
                                                background: 'rgba(239,68,68,0.12)',
                                                border: '1px solid rgba(239,68,68,0.25)',
                                                color: '#fca5a5', padding: '6px 14px',
                                                borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
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
    );
}

// ── Input style — neutral dark, same across all panels ──
const purpleInput = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: '#0b0b0b',          // solid black
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: '11px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};