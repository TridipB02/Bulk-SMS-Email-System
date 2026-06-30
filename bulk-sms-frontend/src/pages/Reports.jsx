import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    BarChart3, Search, CheckCircle, XCircle,
    TrendingUp, Mail, MessageSquare,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Reports() {
    const [searchParams] = useSearchParams();
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState(false);

    useEffect(() => { fetchCampaigns(); }, []);

    useEffect(() => {
        const campaignParam = searchParams.get('campaign');
        if (campaignParam && campaigns.length > 0) {
            setSelectedCampaignId(campaignParam);
            fetchReport(campaignParam);
        }
    }, [searchParams, campaigns]);

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
        background: 'white',
        border: '1px solid #eceefb',
        borderRadius: '16px', padding: '24px',
    };

    const statCard = (label, value, icon, color, bg) => (
        <div style={{
            background: bg,
            borderRadius: '16px', padding: '20px',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: '-22px', right: '-22px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
            }} />
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '14px', position: 'relative',
            }}>
                {icon}
            </div>
            <p style={{ color: '#1e293b', fontSize: '12px', fontWeight: '800', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px', position: 'relative' }}>
                {label}
            </p>
            <p style={{ color, fontSize: '30px', fontWeight: '800', margin: '0', position: 'relative' }}>
                {value}
            </p>
        </div>
    );

    const pieData = report
        ? [
            { name: 'Sent', value: report.totalSent },
            { name: 'Failed', value: report.totalFailed },
        ].filter(d => d.value > 0)
        : [];

    return (
        <div style={{ maxWidth: '1000px' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
                    Delivery Reports
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0', fontWeight: '600' }}>
                    View detailed delivery statistics for your campaigns
                </p>
            </div>

            {/* Campaign Selector */}
            <div style={{
                background: '#aebcf5',
                borderRadius: '16px', padding: '24px',
                marginBottom: '24px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '-30px', right: '-30px',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                }} />
                <label style={{
                    display: 'block', fontSize: '11px', fontWeight: '800',
                    color: '#1f2f8a', marginBottom: '10px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    position: 'relative',
                }}>
                    Select Campaign
                </label>
                <div style={{ position: 'relative' }}>
                    <Search size={16} color="#1f2f8a" style={{
                        position: 'absolute', left: '14px',
                        top: '50%', transform: 'translateY(-50%)'
                    }} />
                    <select
                        value={selectedCampaignId}
                        onChange={handleCampaignChange}
                        style={{
                            width: '100%', padding: '12px 14px 12px 42px',
                            background: 'white',
                            border: 'none',
                            borderRadius: '12px', fontSize: '14px',
                            color: selectedCampaignId ? '#1e293b' : '#94a3b8',
                            outline: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', appearance: 'none',
                            fontWeight: '600',
                        }}
                    >
                        <option value="" style={{ color: '#1e293b', fontWeight: 600 }}>
                            {campaignsLoading ? 'Loading campaigns...' : '— Choose a campaign to view report —'}
                        </option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id} style={{ color: '#1e293b', fontWeight: 600 }}>
                                {c.name} — {c.type} — {new Date(c.createdAt).toLocaleDateString('en-IN')}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} color="#1f2f8a" style={{
                        position: 'absolute', right: '14px',
                        top: '50%', transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                    }} />
                </div>
                {campaigns.length === 0 && !campaignsLoading && (
                    <p style={{ color: '#1f2f8a', fontSize: '13px', margin: '10px 0 0', fontWeight: '700', position: 'relative' }}>
                        No sent campaigns found. Send a campaign first.
                    </p>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <div style={{
                        width: '44px', height: '44px', border: '3px solid #e2e7f7',
                        borderTopColor: '#3b82f6', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ margin: '0', fontWeight: '600' }}>Loading report...</p>
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
                                        background: report.type === 'EMAIL' ? '#dde3fb' : '#bce8cb',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {report.type === 'EMAIL'
                                            ? <Mail size={22} color="#2c3e9e" />
                                            : <MessageSquare size={22} color="#1c6b3b" />
                                        }
                                    </div>
                                    <div>
                                        <h2 style={{ color: '#1e293b', fontWeight: '800', fontSize: '18px', margin: '0 0 4px' }}>
                                            {report.campaignName}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '800',
                                                background: '#dde3fb', color: '#2c3e9e'
                                            }}>
                                                {report.type}
                                            </span>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px',
                                                fontSize: '11px', fontWeight: '800',
                                                background: report.status === 'SENT' ? '#bce8cb' : '#f7b8c4',
                                                color: report.status === 'SENT' ? '#1c6b3b' : '#a31f3c'
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
                                        ${report.successRate >= 80 ? '#2f9b56' : report.successRate >= 50 ? '#caa023' : '#d44d6a'} 
                                        ${report.successRate * 3.6}deg, 
                                        #eef0f9 0deg
                                    )`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%',
                                        background: 'white', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{
                                            fontSize: '14px', fontWeight: '800',
                                            color: report.successRate >= 80 ? '#2f9b56' : report.successRate >= 50 ? '#caa023' : '#d44d6a'
                                        }}>
                                            {report.successRate}%
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '11px', margin: '6px 0 0', fontWeight: '700' }}>
                                    Success Rate
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {statCard('Total Messages', report.totalMessages, <TrendingUp size={20} color="#2c3e9e" />, '#1f2f8a', '#aebcf5')}
                        {statCard('Successfully Sent', report.totalSent, <CheckCircle size={20} color="#125a2c" />, '#125a2c', '#93dba9')}
                        {statCard('Failed', report.totalFailed, <XCircle size={20} color="#7a1530" />, '#7a1530', '#f193a6')}
                    </div>

                    {/* Pie chart + Progress bar side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>

                        {/* Pie Chart */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
                                Sent vs Failed
                            </h3>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px', fontWeight: '600' }}>
                                This campaign's outcome
                            </p>
                            {pieData.length === 0 ? (
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
                                    No data
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={75}
                                            paddingAngle={pieData.length > 1 ? 3 : 0}
                                        >
                                            {pieData.map((entry, i) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={entry.name === 'Sent' ? '#2f9b56' : '#d44d6a'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [`${value} messages`, name]}
                                            contentStyle={{
                                                background: 'white', border: '1px solid #e2e7f7',
                                                borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                            }}
                                        />
                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#374151', fontSize: '13px', fontWeight: '700' }}>Delivery Progress</span>
                                <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '800' }}>
                                    {report.totalSent} / {report.totalMessages}
                                </span>
                            </div>
                            <div style={{
                                height: '10px', background: '#eef0f9',
                                borderRadius: '10px', overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%', borderRadius: '10px',
                                    width: `${report.successRate}%`,
                                    background: report.successRate >= 80
                                        ? '#2f9b56'
                                        : report.successRate >= 50
                                            ? '#caa023'
                                            : '#d44d6a',
                                    transition: 'width 0.6s ease'
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ color: '#2f9b56', fontSize: '12px', fontWeight: '700' }}>
                                    ✓ {report.totalSent} sent
                                </span>
                                {report.totalFailed > 0 && (
                                    <span style={{ color: '#d44d6a', fontSize: '12px', fontWeight: '700' }}>
                                        ✗ {report.totalFailed} failed
                                    </span>
                                )}
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f4f6fd', borderRadius: '10px' }}>
                                    <span style={{ color: '#475569', fontSize: '12px', fontWeight: '700' }}>Campaign Type</span>
                                    <span style={{ color: '#1e293b', fontSize: '12px', fontWeight: '800' }}>{report.type}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f4f6fd', borderRadius: '10px' }}>
                                    <span style={{ color: '#475569', fontSize: '12px', fontWeight: '700' }}>Final Status</span>
                                    <span style={{ color: '#1e293b', fontSize: '12px', fontWeight: '800' }}>{report.status}</span>
                                </div>
                            </div>
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
                                    <h3 style={{ color: '#1e293b', fontWeight: '800', fontSize: '15px', margin: '0 0 2px' }}>
                                        Message Logs
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: '0', fontWeight: '600' }}>
                                        {report.logs.length} records
                                    </p>
                                </div>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: '#f1f2fa',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#475569'
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
                                                    fontSize: '11px', fontWeight: '800',
                                                    color: '#64748b', textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    borderBottom: '1px solid #eef0f9'
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {report.logs.map((log, i) => (
                                            <tr key={log.id} style={{
                                                borderBottom: i < report.logs.length - 1
                                                    ? '1px solid #f4f6fd' : 'none'
                                            }}>
                                                <td style={{ padding: '12px 14px', color: '#1e293b', fontSize: '13px', fontWeight: '600' }}>
                                                    {log.recipient}
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '6px',
                                                            fontSize: '11px', fontWeight: '700',
                                                            background: log.type === 'EMAIL' ? '#dde3fb' : '#bce8cb',
                                                            color: log.type === 'EMAIL' ? '#2c3e9e' : '#1c6b3b'
                                                        }}>
                                                            {log.type}
                                                        </span>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            padding: '2px 8px', borderRadius: '6px',
                                                            fontSize: '11px', fontWeight: '800',
                                                            background: log.status === 'SENT' ? '#bce8cb' : '#f7b8c4',
                                                            color: log.status === 'SENT' ? '#1c6b3b' : '#a31f3c'
                                                        }}>
                                                            {log.status === 'SENT'
                                                                ? <CheckCircle size={10} />
                                                                : <XCircle size={10} />
                                                            }
                                                            {log.status}
                                                        </span>
                                                </td>
                                                <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px', fontWeight: '600' }}>
                                                    {log.sentAt
                                                        ? new Date(log.sentAt).toLocaleString('en-IN')
                                                        : '—'}
                                                </td>
                                                <td style={{ padding: '12px 14px', color: '#a31f3c', fontSize: '12px', fontWeight: '600' }}>
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
                    background: '#e1d4fa',
                    borderRadius: '20px', padding: '80px 40px', textAlign: 'center',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: '-40px', right: '-40px',
                        width: '160px', height: '160px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '-30px', left: '-30px',
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                    }} />
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(255,255,255,0.55)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        position: 'relative',
                    }}>
                        <BarChart3 size={32} color="#5b2bb0" />
                    </div>
                    <h3 style={{ color: '#3a1d77', fontWeight: '800', fontSize: '18px', margin: '0 0 8px', position: 'relative' }}>
                        Select a campaign
                    </h3>
                    <p style={{ color: '#5b2bb0', margin: '0', fontSize: '14px', fontWeight: '700', position: 'relative' }}>
                        Choose a sent campaign from the dropdown above to view its delivery report
                    </p>
                </div>
            )}
        </div>
    );
}