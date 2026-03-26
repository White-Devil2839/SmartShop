const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Public — customers can checkout and view their order confirmation
router.post('/', createOrder);
router.get('/:id', getOrderById);

// Protected — admin only
router.get('/', authenticate, requireAdmin, getAllOrders);

module.exports = router;
