const prisma = require('../config/prisma');

// POST /api/orders - Place an order (checkout)
const createOrder = async (req, res) => {
    try {
        const { items } = req.body;

        // --- Validate input -------------------------------------------
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        const seenIds = new Set();
        for (const item of items) {
            if (!Number.isInteger(item.productId) || item.productId < 1) {
                return res.status(400).json({ error: 'Each item must have a valid positive integer productId' });
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                return res.status(400).json({ error: 'Each item quantity must be a positive integer >= 1' });
            }
            if (item.quantity > 999) {
                return res.status(400).json({ error: 'Quantity cannot exceed 999 per item' });
            }
            if (seenIds.has(item.productId)) {
                return res.status(400).json({ error: `Duplicate productId ${item.productId} in order items. Combine quantities into a single entry.` });
            }
            seenIds.add(item.productId);
        }


        // --- Fetch all products in one query --------------------------
        const productIds = items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true }
        });

        // Check all products exist and are active
        if (products.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products are unavailable' });
        }

        // --- Stock validation -----------------------------------------
        const productMap = Object.fromEntries(products.map(p => [p.id, p]));
        const stockErrors = [];

        for (const item of items) {
            const product = productMap[item.productId];
            if (item.quantity > product.stock) {
                stockErrors.push(
                    `"${product.name}" only has ${product.stock} unit(s) left (requested ${item.quantity})`
                );
            }
        }

        if (stockErrors.length > 0) {
            return res.status(409).json({
                error: 'Insufficient stock',
                details: stockErrors
            });
        }

        // --- Calculate total ------------------------------------------
        const total = items.reduce((sum, item) => {
            return sum + productMap[item.productId].price * item.quantity;
        }, 0);

        // --- Create order + deduct stock in a transaction -------------
        const order = await prisma.$transaction(async (tx) => {
            // Create the order record
            const newOrder = await tx.order.create({
                data: {
                    status: 'confirmed',
                    total,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: productMap[item.productId].price,
                        }))
                    }
                },
                include: {
                    items: {
                        include: { product: { select: { id: true, name: true } } }
                    }
                }
            });

            // Deduct stock for each product
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            return newOrder;
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// GET /api/orders — List all orders (admin), supports ?page=1&limit=10
const getAllOrders = async (req, res) => {
    try {
        const { page, limit } = req.query;

        const include = {
            items: {
                include: { product: { select: { id: true, name: true, imageUrl: true } } },
            },
        };

        // Paginated (opt-in via ?page)
        if (page !== undefined) {
            const pageNum  = Math.max(1, parseInt(page)  || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
            const skip     = (pageNum - 1) * limitNum;

            const [orders, total] = await prisma.$transaction([
                prisma.order.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limitNum, include }),
                prisma.order.count(),
            ]);

            return res.status(200).json({
                data: orders,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }

        // Un-paginated — still return the same envelope shape for consistency
        const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include });
        res.status(200).json({ data: orders, pagination: null });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// GET /api/orders/:id - Single order detail
const getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, imageUrl: true, category: true } }
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// PATCH /api/orders/:id/status — Update order status (admin)
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'];
const VALID_TRANSITIONS = {
    pending:   ['confirmed', 'cancelled'],
    confirmed: ['cancelled'],
    cancelled: [],                        // terminal state
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId) || orderId < 1) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const { status } = req.body;
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
            });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const allowed = VALID_TRANSITIONS[order.status] ?? [];
        if (!allowed.includes(status)) {
            return res.status(409).json({
                error: `Cannot transition from "${order.status}" → "${status}"`,
                allowedTransitions: allowed,
            });
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data:  { status },
            include: {
                items: {
                    include: { product: { select: { id: true, name: true, imageUrl: true } } },
                },
            },
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };
