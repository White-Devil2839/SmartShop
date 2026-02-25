const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Get all products (supports ?category=x&isActive=true)
export const getAllProducts = async (params = {}) => {
    try {
        const query = new URLSearchParams();
        if (params.category) query.set('category', params.category);
        if (params.isActive !== undefined) query.set('isActive', params.isActive);
        const qs = query.toString() ? `?${query.toString()}` : '';

        const response = await fetch(`${API_URL}/api/products${qs}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Get single product by ID
export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

// Create new product
export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// Update existing product
export const updateProduct = async (id, productData) => {
    try {
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Delete product
export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
