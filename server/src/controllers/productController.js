const prisma = require('../config/prisma');

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        // Validate required fields
        if (!name || !description || price === undefined || stock === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'description', 'price', 'stock']
            });
        }

        // Validate data types
        if (typeof price !== 'number' || typeof stock !== 'number') {
            return res.status(400).json({
                error: 'Invalid data types',
                message: 'price and stock must be numbers'
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const { name, description, price, stock } = req.body;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Prepare update data (only include fields that are provided)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) {
            if (typeof price !== 'number') {
                return res.status(400).json({ error: 'Price must be a number' });
            }
            updateData.price = price;
        }
        if (stock !== undefined) {
            if (typeof stock !== 'number') {
                return res.status(400).json({ error: 'Stock must be a number' });
            }
            updateData.stock = stock;
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData
        });

        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        res.status(200).json({
            message: 'Product deleted successfully',
            id: productId
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
    deleteProduct
};
