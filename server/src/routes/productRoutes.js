const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Public — anyone can browse products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected — admin only
router.post('/',     authenticate, requireAdmin, createProduct);
router.put('/:id',   authenticate, requireAdmin, updateProduct);
router.delete('/:id',authenticate, requireAdmin, deleteProduct);

module.exports = router;
