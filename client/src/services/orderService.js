const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * POST /api/orders
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
    // Attach details array if present (stock errors)
    const err = new Error(data.error || 'Failed to place order');
    err.details = data.details || [];
    throw err;
  }
  return data;
};

/**
 * GET /api/orders
 */
export const getAllOrders = async () => {
  const response = await fetch(`${API_URL}/api/orders`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

/**
 * GET /api/orders/:id
 */
export const getOrderById = async (id) => {
  const response = await fetch(`${API_URL}/api/orders/${id}`);
  if (!response.ok) throw new Error('Order not found');
  return response.json();
};
