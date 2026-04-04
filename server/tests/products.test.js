/**
 * Integration tests — Product lifecycle
 *
 * Strategy (Option A from the plan):
 *   - Create a dedicated test admin user in beforeAll using bcryptjs + Prisma directly.
 *   - Log in via POST /api/auth/login to get a real JWT.
 *   - Exercise the full CRUD lifecycle against the real SQLite test DB.
 *   - Clean up (delete the test user and any leftover products) in afterAll.
 *
 * DATABASE_URL must point at the SQLite test file when running:
 *   DATABASE_URL=file:./prisma/test.db npm test
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

// ── Helpers ──────────────────────────────────────────────────────────────────

const TEST_ADMIN = {
    username: '__test_admin__',
    password: 'TestPass123!',
    role: 'admin',
};

const SAMPLE_PRODUCT = {
    name: 'Integration Test Widget',
    description: 'A product created by the automated integration test suite.',
    price: 19.99,
    stock: 50,
    category: 'General',
};

let adminToken = '';
let createdProductId = null;

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeAll(async () => {
    // 1. Ensure the test admin user exists (upsert so re-runs don't fail)
    const hash = await bcrypt.hash(TEST_ADMIN.password, 10);
    await prisma.user.upsert({
        where: { username: TEST_ADMIN.username },
        update: { password: hash },
        create: { username: TEST_ADMIN.username, password: hash, role: TEST_ADMIN.role },
    });

    // 2. Log in to obtain a JWT
    const res = await request(app)
        .post('/api/auth/login')
        .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
});

afterAll(async () => {
    // Clean up: remove any products created during tests, then the test user
    if (createdProductId) {
        await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    await prisma.user.deleteMany({ where: { username: TEST_ADMIN.username } });
    await prisma.$disconnect();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
    it('returns 200 with a data array and pagination field', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        // Un-paginated call always returns pagination: null
        expect(res.body.pagination).toBeNull();
    });

    it('returns paginated envelope when ?page=1 is supplied', async () => {
        const res = await request(app).get('/api/products?page=1&limit=5');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toMatchObject({
            page: 1,
            limit: 5,
        });
    });
});

describe('POST /api/products', () => {
    it('returns 401 when no token is provided', async () => {
        const res = await request(app).post('/api/products').send(SAMPLE_PRODUCT);
        expect(res.statusCode).toBe(401);
    });

    it('creates a product and returns 201 when admin token is supplied', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(SAMPLE_PRODUCT);

        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({
            name: SAMPLE_PRODUCT.name,
            price: SAMPLE_PRODUCT.price,
            stock: SAMPLE_PRODUCT.stock,
            category: SAMPLE_PRODUCT.category,
        });
        expect(res.body).toHaveProperty('id');

        // Persist for use in subsequent tests
        createdProductId = res.body.id;
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'No price or stock' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
});

describe('GET /api/products/:id', () => {
    it('returns the created product with correct fields', async () => {
        // This test must run after POST creates the product
        expect(createdProductId).not.toBeNull();

        const res = await request(app).get(`/api/products/${createdProductId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            id: createdProductId,
            name: SAMPLE_PRODUCT.name,
            price: SAMPLE_PRODUCT.price,
        });
    });

    it('returns 404 for a non-existent product ID', async () => {
        const res = await request(app).get('/api/products/9999999');
        expect(res.statusCode).toBe(404);
    });

    it('returns 400 for an invalid (non-integer) product ID', async () => {
        const res = await request(app).get('/api/products/abc');
        expect(res.statusCode).toBe(400);
    });
});

describe('DELETE /api/products/:id', () => {
    it('returns 401 when no token is provided', async () => {
        expect(createdProductId).not.toBeNull();
        const res = await request(app).delete(`/api/products/${createdProductId}`);
        expect(res.statusCode).toBe(401);
    });

    it('hard-deletes the product (no order history) and returns 200', async () => {
        expect(createdProductId).not.toBeNull();
        const res = await request(app)
            .delete(`/api/products/${createdProductId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ softDeleted: false, id: createdProductId });

        // Verify it's gone
        const check = await request(app).get(`/api/products/${createdProductId}`);
        expect(check.statusCode).toBe(404);

        // Prevent afterAll from trying to double-delete
        createdProductId = null;
    });
});
