const rateLimit = require('express-rate-limit');

/**
 * Login rate limiter (C3)
 * Max 10 attempts per IP per 15-minute window.
 * Failed attempts count; successful logins are skipped.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,   // Return rate-limit info in `RateLimit-*` headers
    legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true, // Only count failed attempts against the limit
    message: {
        error: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    },
});

module.exports = { loginLimiter };
