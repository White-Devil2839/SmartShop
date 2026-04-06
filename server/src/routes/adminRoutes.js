const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/admin/stats  — admin-only analytics
router.get('/stats', authenticate, requireAdmin, getStats);

module.exports = router;
