import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../services/orderService';

const LIMIT = 10;

const STATUS_META = {
  pending:   { label: 'Pending',   cls: 'order-status-pending'   },
  confirmed: { label: 'Confirmed', cls: 'order-status-confirmed' },
  cancelled: { label: 'Cancelled', cls: 'order-status-cancelled' },
};

const VALID_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  cancelled: [],
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, cls: '' };
  return <span className={`order-status-badge ${meta.cls}`}>{meta.label}</span>;
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const { token } = useAuth();

  const transitions = VALID_TRANSITIONS[order.status] || [];

  const handleStatusUpdate = async (newStatus) => {
    setStatusError(null);
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus, token);
      onStatusChange(updated);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <tr
        className={`order-row ${expanded ? 'order-row-expanded' : ''}`}
        onClick={() => setExpanded(e => !e)}
        title="Click to expand"
      >
        <td><strong>#{order.id}</strong></td>
        <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        <td><StatusBadge status={order.status} /></td>
        <td>{order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}</td>
        <td><strong>${order.total.toFixed(2)}</strong></td>
        <td className="expand-toggle">{expanded ? '▲' : '▼'}</td>
      </tr>

      {expanded && (
        <tr className="order-detail-row">
          <td colSpan={6}>
            <div className="order-detail-panel">

              {/* Items list */}
              <div className="order-detail-items">
                <h4>Items</h4>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="order-item-name-cell">
                            {item.product?.imageUrl && (
                              <img src={item.product.imageUrl} alt={item.product?.name} className="admin-thumb" />
                            )}
                            <span>{item.product?.name ?? '(deleted product)'}</span>
                          </div>
                        </td>
                        <td>${item.unitPrice.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status actions */}
              <div className="order-detail-actions">
                <div>
                  <span className="order-detail-label">Status:</span>
                  <StatusBadge status={order.status} />
                </div>
                {statusError && <p className="order-status-error">⚠️ {statusError}</p>}
                {transitions.length > 0 && (
                  <div className="order-transition-btns">
                    <span className="order-detail-label">Change to:</span>
                    {transitions.map(s => (
                      <button
                        key={s}
                        className={`btn btn-sm order-transition-btn order-transition-${s}`}
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(s); }}
                        disabled={updating}
                      >
                        {updating ? '…' : STATUS_META[s]?.label ?? s}
                      </button>
                    ))}
                  </div>
                )}
                {transitions.length === 0 && (
                  <p className="order-terminal-note">This order is in a terminal state and cannot be changed.</p>
                )}
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

OrderRow.propTypes = {
  order: PropTypes.shape({
    id:        PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    status:    PropTypes.string.isRequired,
    total:     PropTypes.number.isRequired,
    items:     PropTypes.arrayOf(PropTypes.shape({
      id:        PropTypes.number.isRequired,
      unitPrice: PropTypes.number.isRequired,
      quantity:  PropTypes.number.isRequired,
      product:   PropTypes.shape({
        id:       PropTypes.number,
        name:     PropTypes.string,
        imageUrl: PropTypes.string,
      }),
    })).isRequired,
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchOrders = useCallback(async (p) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllOrders(token, { page: p, limit: LIMIT });
      setOrders(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(page); }, [fetchOrders, page]);

  const handleStatusChange = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const goTo = (p) => { setPage(p); };

  if (loading) return (
    <div className="admin-loading orders-loading">
      <span className="orders-spinner" aria-hidden="true" />
      <span>Loading orders…</span>
    </div>
  );
  if (error)   return (
    <div className="admin-error">
      <p>⚠️ {error}</p>
      <button className="btn btn-outline" onClick={() => fetchOrders(page)}>Retry</button>
    </div>
  );

  return (
    <div className="admin-orders-wrapper">
      {orders.length === 0 ? (
        <div className="admin-empty"><p>No orders placed yet.</p></div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="btn btn-sm btn-secondary" onClick={() => goTo(1)}       disabled={page === 1}>«</button>
              <button className="btn btn-sm btn-secondary" onClick={() => goTo(page - 1)} disabled={page === 1}>‹ Prev</button>
              <span className="pagination-info">
                Page {page} of {pagination.totalPages}
                <span className="pagination-total">({pagination.total} orders)</span>
              </span>
              <button className="btn btn-sm btn-secondary" onClick={() => goTo(page + 1)} disabled={page === pagination.totalPages}>Next ›</button>
              <button className="btn btn-sm btn-secondary" onClick={() => goTo(pagination.totalPages)} disabled={page === pagination.totalPages}>»</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminOrders;
