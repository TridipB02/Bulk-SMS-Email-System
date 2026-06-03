import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    BarChart3, Search, CheckCircle, XCircle,
    Clock, TrendingUp, Mail, MessageSquare,
    ChevronDown, ChevronUp, Download
} from 'lucide-react';

export default function Reports() {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState(false);

    useEffect(() => { fetchCampaigns(); }, []);

    const fetchCampaigns = async () => {
        setCampaignsLoading(true);
        try {
            const res = await api.get('/api/campaigns/my');
            const sent = res.data.filter(c => c.status === 'SENT' || c.status === 'FAILED');
            setCampaigns(sent);
        } catch {
            toast.error('Failed to load campaigns');
        } finally {
            setCampaignsLoading(false);
        }
    };

    const fetchReport = async (campaignId) => {
        if (!campaignId) return;
        setLoading(true);
        setReport(null);
        try {
            const res = await api.get(`/api/reports/campaign/${campaignId}`);
            setReport(res.data);
        } catch {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleCampaignChange = (e) => {
        const id = e.target.value;
        setSelectedCampaignId(id);
        fetchReport(id);
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '24px',
    };

    const statCard = (label, value, icon, color, bg) => (
        <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${bg}`,
            borderRadius: '14px', padding: '20px',
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '14px'
            }}>
                {icon}
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: '600', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </p>
            <p style={{ color, fontSize: '30px', fontWeight: '800', margin: '0' }}>
                {value}
            </p>
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>
                    Delivery Reports
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0' }}>
                    View detailed delivery statistics for your campaigns
                </p>
            </div>

            {/* Campaign Selector */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
                <label style={{
                    display: 'block', fontSize: '12px', fontWeight: '700',
                    color: '#64748b', marginBottom: '10px',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                    Select Campaign
                </label>
                <div style={{ position: 'relative' }}>
                    <Search size={16} color="#cbd5e1" style={{
                        position: 'absolute', left: '14px',
                        top: '50%', transform: 'translateY(-50%)'
                    }} />
                    <select
                        value={selectedCampaignId}
                        onChange={handleCampaignChange}
                        style={{
                            width: '100%', padding: '12px 14px 12px 42px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px', fontSize: '14px',
                            color: selectedCampaignId ? '#f1f5f9' : '#cbd5e1',
                            outline: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', appearance: 'none'
                        }}
                    >
                        <option value="" style={{ background: '#0f172a' }}>
                            {campaignsLoading ? 'Loading campaigns...' : '— Choose a campaign to view report —'}
                        </option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>
                                {c.name} — {c.type} — {new Date(c.createdAt).toLocaleDateString('en-IN')}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} color="#cbd5e1" style={{
                        position: 'absolute', right: '14px',
                        top: '50%', transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                    }} />
                </div>
                {campaigns.length === 0 && !campaignsLoading && (
                    <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '10px 0 0' }}>
                        No sent campaigns found. Send a campaign first.
                    </p>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#cbd5e1' }}>
                    <div style={{
                        width: '44px', height: '44px', border: '3px solid rgba(255,255,255,0.1)',
                        borderTopColor: '#3b82f6', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ margin: '0' }}>Loading report...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Report */}
            {report && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Campaign Info */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: report.type === 'EMAIL'
                                            ? 'rgba(37,99,235,0.2)' : 'rgba(34,197,94,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {report.type === 'EMAIL'
                                            ? <Mail size={22} color="#60a5fa" />
                                            : <MessageSquare size={22} color="#4ade80" />
                                        }
                                    </div>
                                    <div>
                                        <h2 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', margin: '0 0 4px' }}>
                                            {report.campaignName}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '700',
                                                background: 'rgba(37,99,235,0.15)', color: '#60a5fa'
                                            }}>
                                                {report.type}
                                            </span>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '700',
                                                background: report.status === 'SENT'
                                                    ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                color: report.status === 'SENT' ? '#4ade80' : '#f87171'
                                            }}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Success Rate Circle */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: `conic-gradient(
                                        ${report.successRate >= 80 ? '#4ade80' : report.successRate >= 50 ? '#fbbf24' : '#f87171'} 
                                        ${report.successRate * 3.6}deg, 
                                        rgba(255,255,255,0.06) 0deg
                                    )`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%',
                                        background: '#0f172a', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{
                                            fontSize: '14px', fontWeight: '800',
                                            color: report.successRate >= 80 ? '#4ade80' : report.successRate >= 50 ? '#fbbf24' : '#f87171'
                                        }}>
                                            {report.successRate}%
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '11px', margin: '6px 0 0', fontWeight: '600' }}>
                                    Success Rate
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {statCard('Total Messages', report.totalMessages, <TrendingUp size={20} color="#60a5fa" />, '#60a5fa', 'rgba(37,99,235,0.15)')}
                        {statCard('Successfully Sent', report.totalSent, <CheckCircle size={20} color="#4ade80" />, '#4ade80', 'rgba(34,197,94,0.15)')}
                        {statCard('Failed', report.totalFailed, <XCircle size={20} color="#f87171" />, '#f87171', 'rgba(239,68,68,0.15)')}
                    </div>

                    {/* Progress Bar */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Delivery Progress</span>
                            <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '700' }}>
                                {report.totalSent} / {report.totalMessages}
                            </span>
                        </div>
                        <div style={{
                            height: '10px', background: 'rgba(255,255,255,0.07)',
                            borderRadius: '10px', overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%', borderRadius: '10px',
                                width: `${report.successRate}%`,
                                background: report.successRate >= 80
                                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                    : report.successRate >= 50
                                        ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                                        : 'linear-gradient(90deg, #dc2626, #f87171)',
                                transition: 'width 0.6s ease'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>
                                ✓ {report.totalSent} sent
                            </span>
                            {report.totalFailed > 0 && (
                                <span style={{ color: '#f87171', fontSize: '12px', fontWeight: '600' }}>
                                    ✗ {report.totalFailed} failed
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Message Logs */}
                    {report.logs && report.logs.length > 0 && (
                        <div style={cardStyle}>
                            <button
                                onClick={() => setExpandedLogs(!expandedLogs)}
                                style={{
                                    width: '100%', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '0', marginBottom: expandedLogs ? '20px' : '0'
                                }}
                            >
                                <div>
                                    <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px', margin: '0 0 2px' }}>
                                        Message Logs
                                    </h3>
                                    <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '0' }}>
                                        {report.logs.length} records
                                    </p>
                                </div>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.07)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#64748b'
                                }}>
                                    {expandedLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>

                            {expandedLogs && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                        <tr>
                                            {['Recipient', 'Type', 'Status', 'Sent At', 'Failure Reason'].map(h => (
                                                <th key={h} style={{
                                                    padding: '10px 14px', textAlign: 'left',
                                                    fontSize: '11px', fontWeight: '700',
                                                    color: '#cbd5e1', textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {report.logs.map((log, i) => (
                                            <tr key={log.id} style={{
                                                borderBottom: i < report.logs.length - 1
                                                    ? '1px solid rgba(255,255,255,0.04)' : 'none'
                                            }}>
                                                <td style={{ padding: '12px 14px', color: '#cbd5e1', fontSize: '13px' }}>
                                                    {log.recipient}
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '6px',
                                                            fontSize: '11px', fontWeight: '600',
                                                            background: log.type === 'EMAIL'
                                                                ? 'rgba(37,99,235,0.15)' : 'rgba(34,197,94,0.15)',
                                                            color: log.type === 'EMAIL' ? '#60a5fa' : '#4ade80'
                                                        }}>
                                                            {log.type}
                                                        </span>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            padding: '2px 8px', borderRadius: '6px',
                                                            fontSize: '11px', fontWeight: '700',
                                                            background: log.status === 'SENT'
                                                                ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                            color: log.status === 'SENT' ? '#4ade80' : '#f87171'
                                                        }}>
                                                            {log.status === 'SENT'
                                                                ? <CheckCircle size={10} />
                                                                : <XCircle size={10} />
                                                            }
                                                            {log.status}
                                                        </span>
                                                </td>
                                                <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>
                                                    {log.sentAt
                                                        ? new Date(log.sentAt).toLocaleString('en-IN')
                                                        : '—'}
                                                </td>
                                                <td style={{ padding: '12px 14px', color: '#f87171', fontSize: '12px' }}>
                                                    {log.failureReason || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!report && !loading && !selectedCampaignId && (
                <div style={{
                    ...cardStyle, textAlign: 'center', padding: '80px 40px'
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(37,99,235,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <BarChart3 size={32} color="#3b82f6" />
                    </div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', margin: '0 0 8px' }}>
                        Select a campaign
                    </h3>
                    <p style={{ color: '#cbd5e1', margin: '0', fontSize: '14px' }}>
                        Choose a sent campaign from the dropdown above to view its delivery report
                    </p>
                </div>
            )}
        </div>
    );
}