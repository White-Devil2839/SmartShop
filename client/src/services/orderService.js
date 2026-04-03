const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const authHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * POST /api/orders — anonymous checkout
 * items: [{ productId, quantity }]
 */
export const placeOrder = async (items) => {
    const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
    });
    const data = await response.json();
    if (!response.ok) {
        const err = new Error(data.error || 'Failed to place order');
        err.details = data.details || [];
        throw err;
    }
    return data;
};

/**
 * GET /api/orders/:id — requires auth token (C4)
 */
export const getOrderById = async (id, token) => {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: authHeaders(token),
    });
    const data = await response.json();
    if (!response.ok) {
        const err = new Error(data.error || 'Failed to fetch order');
        err.status = response.status;
        throw err;
    }
    return data;
};

/**
 * GET /api/orders — admin only
 * Accepts { page, limit } for paginated response: { data, pagination }
 */
export const getAllOrders = async (token, params = {}) => {
    const qs = new URLSearchParams();
    if (params.page  !== undefined) qs.set('page',  params.page);
    if (params.limit !== undefined) qs.set('limit', params.limit);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const response = await fetch(`${API_URL}/api/orders${query}`, {
        headers: authHeaders(token),
    });
    const data = await response.json();
    if (!response.ok) {
        const err = new Error(data.error || 'Failed to fetch orders');
        err.status = response.status;
        throw err;
    }
    return data;
};

/**
 * PATCH /api/orders/:id/status — admin only
 * status: 'pending' | 'confirmed' | 'cancelled'
 */
export const updateOrderStatus = async (id, status, token) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
        const err = new Error(data.error || 'Failed to update order status');
        err.status = response.status;
        throw err;
    }
    return data;
};
