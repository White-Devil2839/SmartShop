const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById } = require('../controllers/orderController');

// POST /api/orders - Place a new order (checkout)
router.post('/', createOrder);

// GET /api/orders - List all orders (admin)
router.get('/', getAllOrders);

// GET /api/orders/:id - Get single order detail
router.get('/:id', getOrderById);

module.exports = router;
