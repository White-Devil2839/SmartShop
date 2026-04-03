const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const authHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Get all products (supports ?category=x&isActive=true&page=1&limit=20)
// Always receives { data, pagination } envelope from the backend
export const getAllProducts = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.isActive !== undefined) query.set('isActive', params.isActive);
    if (params.page  !== undefined) query.set('page',  params.page);
    if (params.limit !== undefined) query.set('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/api/products${qs}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const result = await response.json();
    // Always extract data array — pagination is attached when page param used
    return params.page !== undefined ? result : result.data;
};

// Get single product by ID
export const getProductById = async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
};

// Create new product (admin)
export const createProduct = async (productData, token) => {
    const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create product');
    return data;
};

// Update product (admin)
export const updateProduct = async (id, productData, token) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update product');
    return data;
};

// Delete product (admin)
export const deleteProduct = async (id, token) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete product');
    return data;
};
