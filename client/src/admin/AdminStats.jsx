import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAdminStats } from '../services/adminService';

const STATUS_COLOR = {
    pending:   { bg: '#fef3c7', text: '#92400e', bar: '#f59e0b' },
    confirmed: { bg: '#dbeafe', text: '#1e40af', bar: '#3b82f6' },
    shipped:   { bg: '#ede9fe', text: '#5b21b6', bar: '#8b5cf6' },
    delivered: { bg: '#dcfce7', text: '#15803d', bar: '#22c55e' },
    cancelled: { bg: '#fee2e2', text: '#991b1b', bar: '#ef4444' },
};

const STATUS_ICON = {
    pending:   '⏳',
    confirmed: '✅',
    shipped:   '🚚',
    delivered: '📦',
    cancelled: '❌',
};

function KpiCard({ icon, value, label, accent }) {
    return (
        <div className="kpi-card" style={{ borderTop: `4px solid ${accent}` }}>
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-body">
                <div className="kpi-value">{value}</div>
                <div className="kpi-label">{label}</div>
            </div>
        </div>
    );
}

KpiCard.propTypes = {
    icon: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
};

export default function AdminStats() {
    const [stats, setStats]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    useEffect(() => {
        getAdminStats()
            .then(setStats)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="stats-loading">
            <div className="spinner" />
            <p>Loading analytics…</p>
        </div>
    );

    if (error) return <div className="stats-error">⚠️ {error}</div>;
    if (!stats) return null;

    const totalStatusOrders = Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0);

    return (
        <div className="stats-container">

            {/* ── KPI row ── */}
            <div className="kpi-grid">
                <KpiCard
                    icon="💰"
                    value={`$${(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    label="Total Revenue"
                    accent="#22c55e"
                />
                <KpiCard
                    icon="📦"
                    value={stats.totalOrders}
                    label="Total Orders"
                    accent="#3b82f6"
                />
                <KpiCard
                    icon="🏷️"
                    value={stats.totalProducts}
                    label="Active Products"
                    accent="#8b5cf6"
                />
                <KpiCard
                    icon="⚠️"
                    value={stats.lowStockProducts}
                    label="Low Stock Alerts"
                    accent={stats.lowStockProducts > 0 ? '#ef4444' : '#94a3b8'}
                />
            </div>

            {/* ── Lower row ── */}
            <div className="stats-lower">

                {/* Status breakdown */}
                <div className="stats-card">
                    <h3 className="stats-card-title">Orders by Status</h3>
                    {Object.keys(stats.ordersByStatus).length === 0 ? (
                        <p className="stats-empty">No orders yet.</p>
                    ) : (
                        <div className="status-bars">
                            {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                                const pct = totalStatusOrders > 0 ? (count / totalStatusOrders) * 100 : 0;
                                const c = STATUS_COLOR[status] || { bg: '#f1f5f9', text: '#475569', bar: '#94a3b8' };
                                return (
                                    <div key={status} className="status-bar-row">
                                        <span className="status-bar-label">
                                            {STATUS_ICON[status] || '•'} {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                        <div className="status-bar-track">
                                            <div className="status-bar-fill" style={{ width: `${pct}%`, background: c.bar }} />
                                        </div>
                                        <span className="status-chip" style={{ background: c.bg, color: c.text }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent orders */}
                <div className="stats-card">
                    <h3 className="stats-card-title">Recent Orders</h3>
                    {stats.recentOrders.length === 0 ? (
                        <p className="stats-empty">No orders yet.</p>
                    ) : (
                        <div className="recent-list">
                            {stats.recentOrders.map(order => {
                                const c = STATUS_COLOR[order.status] || {};
                                return (
                                    <div key={order.id} className="recent-row">
                                        <span className="recent-id">#{order.id}</span>
                                        <span className="recent-items">
                                            {order.items.map(i => i.product?.name).filter(Boolean).join(', ') || '—'}
                                        </span>
                                        <span className="recent-total">${order.total.toFixed(2)}</span>
                                        <span className="status-chip" style={{ background: c.bg, color: c.text }}>
                                            {order.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
