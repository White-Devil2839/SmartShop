const express  = require('express');
const router   = express.Router();
const { createOrder, getAllOrders, getOrderById } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Public — customers place orders anonymously
router.post('/', createOrder);

// Protected — authenticated users (admin) only (C4)
router.get('/:id', authenticate, getOrderById);
router.get('/',    authenticate, requireAdmin, getAllOrders);

module.exports = router;

