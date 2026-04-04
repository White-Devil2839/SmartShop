// Test setup file for Vitest
// This runs before each test file

// Extends Vitest matchers with jest-dom custom matchers
// like toBeInTheDocument(), toHaveTextContent(), etc.
import '@testing-library/jest-dom';

// Clean up after each test to avoid test state leaking
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

// ── localStorage mock ─────────────────────────────────────────────────────────
// AuthContext reads localStorage inside a useState() lazy initializer, which
// runs synchronously during the first render.  jsdom exposes localStorage, but
// some Vitest environments report it as non-function when the module graph is
// still loading.  An explicit in-memory mock guarantees it is always available.
const localStorageMock = (() => {
    let store = {};
    return {
        getItem:    (key)        => store[key] ?? null,
        setItem:    (key, value) => { store[key] = String(value); },
        removeItem: (key)        => { delete store[key]; },
        clear:      ()           => { store = {}; },
    };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Reset localStorage between tests so state doesn't leak across suites
beforeEach(() => {
    localStorageMock.clear();
});

// ── Other globals ─────────────────────────────────────────────────────────────

// Mock window.confirm for delete confirmation tests
vi.stubGlobal('confirm', vi.fn(() => true));

// Mock fetch globally so API calls don't hit real endpoints
vi.stubGlobal('fetch', vi.fn());

// Suppress console.error noise during tests (optional: remove to see full logs)
vi.spyOn(console, 'error').mockImplementation(() => {});
