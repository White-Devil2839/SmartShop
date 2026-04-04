/**
 * Unit tests — productService.getAllProducts
 *
 * Mocks global.fetch so no real network calls are made.
 * Verifies the envelope-extraction logic introduced in the API update:
 *   - Without ?page  → returns result.data  (plain array)
 *   - With    ?page  → returns full envelope { data, pagination }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllProducts } from './productService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
    { id: 1, name: 'Widget A', price: 9.99, stock: 10, category: 'General', isActive: true },
    { id: 2, name: 'Widget B', price: 19.99, stock: 5, category: 'Electronics', isActive: true },
];

const MOCK_ENVELOPE = {
    data: MOCK_PRODUCTS,
    pagination: null,
};

const MOCK_PAGINATED_ENVELOPE = {
    data: MOCK_PRODUCTS,
    pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

function makeFetchMock(payload) {
    return vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(payload),
        })
    );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('getAllProducts — unpaginated call (no ?page)', () => {
    it('extracts and returns the data array from the envelope', async () => {
        global.fetch = makeFetchMock(MOCK_ENVELOPE);

        const result = await getAllProducts();

        expect(result).toEqual(MOCK_PRODUCTS);
        expect(Array.isArray(result)).toBe(true);
    });

    it('calls fetch with the correct base URL and no query string', async () => {
        global.fetch = makeFetchMock(MOCK_ENVELOPE);

        await getAllProducts();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toMatch(/\/api\/products$/);
    });

    it('appends category filter to the URL when provided', async () => {
        global.fetch = makeFetchMock(MOCK_ENVELOPE);

        await getAllProducts({ category: 'Electronics' });

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toContain('category=Electronics');
    });

    it('throws when the response is not ok', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
        );

        await expect(getAllProducts()).rejects.toThrow('Failed to fetch products');
    });
});

describe('getAllProducts — paginated call (with ?page)', () => {
    it('returns the full envelope (data + pagination) when page param is provided', async () => {
        global.fetch = makeFetchMock(MOCK_PAGINATED_ENVELOPE);

        const result = await getAllProducts({ page: 1, limit: 20 });

        // Paginated mode returns the full envelope so callers can read pagination
        expect(result).toEqual(MOCK_PAGINATED_ENVELOPE);
        expect(result.pagination).not.toBeNull();
        expect(result.data).toEqual(MOCK_PRODUCTS);
    });

    it('appends page and limit to the URL', async () => {
        global.fetch = makeFetchMock(MOCK_PAGINATED_ENVELOPE);

        await getAllProducts({ page: 2, limit: 10 });

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toContain('page=2');
        expect(calledUrl).toContain('limit=10');
    });
});
