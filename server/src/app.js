const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app = express();

// ── Security headers (H1) ────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, health checkers)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL,
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50kb' })); // Limit request body size

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SmartShop Backend is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('SmartShop Backend Services is Running');
});

// ── API Routes ────────────────────────────────────────────────────────────────
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const authRoutes    = require('./routes/authRoutes');
const adminRoutes   = require('./routes/adminRoutes');
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/admin',    adminRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

// ── Global Error Handler (M1) ─────────────────────────────────────────────────
// In production, never leak internal error details to the client
app.use((err, req, res, next) => {
    console.error('[Global Error]', err);

    const statusCode = err.status || 500;
    const isProd     = process.env.NODE_ENV === 'production';

    // For server errors in production, return a generic message
    const message = (isProd && statusCode === 500)
        ? 'Internal server error'
        : (err.message || 'Internal server error');

    res.status(statusCode).json({ error: message });
});

module.exports = app;
