const prisma = require('../config/prisma');

// ── Constants ────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
    'General', 'Electronics', 'Clothing',
    'Home & Kitchen', 'Sports', 'Books', 'Toys', 'Other',
];
const MAX_NAME_LEN = 200;
const MAX_DESC_LEN = 2000;
const MAX_URL_LEN  = 500;

// Validate imageUrl: must be http/https or null/empty
const isValidImageUrl = (url) => {
    if (!url) return true;
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

// ── Create a new product ─────────────────────────────────────────────────────
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl, category, isActive } = req.body;

        // Required fields
        if (!name || !description || price === undefined || stock === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'description', 'price', 'stock'],
            });
        }

        // Type validation
        if (typeof price !== 'number' || typeof stock !== 'number') {
            return res.status(400).json({
                error: 'Invalid data types: price and stock must be numbers',
            });
        }

        if (price <= 0) {
            return res.status(400).json({ error: 'Price must be greater than 0' });
        }

        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({ error: 'Stock must be a non-negative integer' });
        }

        // String length limits (H2)
        if (name.trim().length > MAX_NAME_LEN) {
            return res.status(400).json({ error: `Product name must be ${MAX_NAME_LEN} characters or fewer` });
        }
        if (description.trim().length > MAX_DESC_LEN) {
            return res.status(400).json({ error: `Description must be ${MAX_DESC_LEN} characters or fewer` });
        }

        // Category enum validation (H2)
        const resolvedCategory = category || 'General';
        if (!VALID_CATEGORIES.includes(resolvedCategory)) {
            return res.status(400).json({
                error: `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}`,
            });
        }

        // imageUrl must be http/https (H2)
        if (imageUrl && !isValidImageUrl(imageUrl)) {
            return res.status(400).json({ error: 'imageUrl must be a valid http or https URL' });
        }

        if (imageUrl && imageUrl.length > MAX_URL_LEN) {
            return res.status(400).json({ error: `imageUrl must be ${MAX_URL_LEN} characters or fewer` });
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description.trim(),
                price,
                stock,
                imageUrl: imageUrl?.trim() || null,
                category: resolvedCategory,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// ── Get all products ─────────────────────────────────────────────────────────
// Supports ?category=Electronics&isActive=true&page=1&limit=20
// Backward-compat: without ?page returns plain array; with ?page returns { data, pagination }
const getAllProducts = async (req, res) => {
    try {
        const { category, isActive, page, limit } = req.query;

        const where = {};
        if (category) where.category = category;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        // Paginated response (opt-in via ?page)
        if (page !== undefined) {
            const pageNum  = Math.max(1, parseInt(page)  || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
            const skip     = (pageNum - 1) * limitNum;

            const [products, total] = await prisma.$transaction([
                prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limitNum }),
                prisma.product.count({ where }),
            ]);

            return res.status(200).json({
                data: products,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }

        // Un-paginated — return consistent envelope { data, pagination: null }
        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ data: products, pagination: null });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// ── Get a single product by ID ───────────────────────────────────────────────
const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId) || productId < 1) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// ── Update a product ─────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId) || productId < 1) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const { name, description, price, stock, imageUrl, category, isActive } = req.body;

        const existing = await prisma.product.findUnique({ where: { id: productId } });
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updateData = {};

        if (name !== undefined) {
            if (name.trim().length === 0) return res.status(400).json({ error: 'Name cannot be empty' });
            if (name.trim().length > MAX_NAME_LEN) return res.status(400).json({ error: `Name must be ${MAX_NAME_LEN} characters or fewer` });
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            if (description.trim().length === 0) return res.status(400).json({ error: 'Description cannot be empty' });
            if (description.trim().length > MAX_DESC_LEN) return res.status(400).json({ error: `Description must be ${MAX_DESC_LEN} characters or fewer` });
            updateData.description = description.trim();
        }
        if (price !== undefined) {
            if (typeof price !== 'number' || price <= 0) return res.status(400).json({ error: 'Price must be a positive number' });
            updateData.price = price;
        }
        if (stock !== undefined) {
            if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) return res.status(400).json({ error: 'Stock must be a non-negative integer' });
            updateData.stock = stock;
        }
        if (imageUrl !== undefined) {
            if (imageUrl && !isValidImageUrl(imageUrl)) return res.status(400).json({ error: 'imageUrl must be a valid http or https URL' });
            if (imageUrl && imageUrl.length > MAX_URL_LEN) return res.status(400).json({ error: `imageUrl must be ${MAX_URL_LEN} characters or fewer` });
            updateData.imageUrl = imageUrl?.trim() || null;
        }
        if (category !== undefined) {
            if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}` });
            updateData.category = category;
        }
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });

        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// ── Delete a product (with soft-delete protection) (C1) ──────────────────────
const deleteProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId) || productId < 1) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const existing = await prisma.product.findUnique({
            where: { id: productId },
            include: { _count: { select: { orderItems: true } } },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // If the product is referenced in any order, soft delete to preserve history (C1)
        if (existing._count.orderItems > 0) {
            const product = await prisma.product.update({
                where: { id: productId },
                data: { isActive: false },
            });
            return res.status(200).json({
                message: 'Product has order history and cannot be permanently deleted. It has been hidden from the storefront.',
                softDeleted: true,
                product,
            });
        }

        // No order references — safe to hard delete
        await prisma.product.delete({ where: { id: productId } });

        res.status(200).json({
            message: 'Product permanently deleted.',
            softDeleted: false,
            id: productId,
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
