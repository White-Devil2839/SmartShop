require('dotenv').config();

// ── Startup validation ───────────────────────────────────────────────────────
// Refuse to start if critical secrets are missing — never fall back to defaults
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
    process.exit(1);
}

const app    = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ── Graceful shutdown (M3) ───────────────────────────────────────────────────
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully…`);
    server.close(async () => {
        await prisma.$disconnect();
        console.log('HTTP server closed. Database disconnected.');
        process.exit(0);
    });
    // Force exit if server hasn't closed after 10 s
    setTimeout(() => process.exit(1), 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
