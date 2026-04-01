const express  = require('express');
const router   = express.Router();
const { login, me } = require('../controllers/authController');
const { authenticate }  = require('../middleware/authMiddleware');
const { loginLimiter }  = require('../middleware/rateLimitMiddleware');

// POST /api/auth/login  — rate limited (C3): 10 attempts / 15 min per IP
router.post('/login', loginLimiter, login);

// GET /api/auth/me — validate stored token
router.get('/me', authenticate, me);

module.exports = router;

