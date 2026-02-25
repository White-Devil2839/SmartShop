import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../services/productService';

const CATEGORIES = ['General', 'Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Books', 'Toys', 'Other'];

function AdminProductForm({ product, onClose, onSuccess }) {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    category: 'General',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
        category: product.category || 'General',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked
        : (name === 'price' || name === 'stock') ? (parseFloat(value) || '')
        : value
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) { setError('Product name is required'); return false; }
    if (!formData.description.trim()) { setError('Description is required'); return false; }
    if (!formData.price || formData.price <= 0) { setError('Price must be greater than 0'); return false; }
    if (formData.stock === '' || formData.stock < 0) { setError('Stock must be 0 or greater'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrl.trim() || null,
        category: formData.category,
        isActive: formData.isActive,
      };

      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="form-error">⚠️ {error}</div>}

          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input type="text" id="name" name="name" value={formData.name}
              onChange={handleChange} disabled={loading} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={formData.description}
              onChange={handleChange} rows="3" disabled={loading} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input type="number" id="price" name="price" value={formData.price}
                onChange={handleChange} step="0.01" min="0.01" disabled={loading} required />
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input type="number" id="stock" name="stock" value={formData.stock}
                onChange={handleChange} min="0" disabled={loading} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category}
                onChange={handleChange} disabled={loading}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group form-group-checkbox">
              <label className="checkbox-label">
                <input type="checkbox" name="isActive" checked={formData.isActive}
                  onChange={handleChange} disabled={loading} />
                <span>Active (visible on storefront)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl}
              onChange={handleChange} placeholder="https://example.com/image.jpg"
              disabled={loading} />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Preview" className="image-preview"
                onError={(e) => e.target.style.display = 'none'} />
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProductForm;
