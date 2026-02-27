// Test setup file for Vitest
// This runs before each test file

// Extends Vitest matchers with jest-dom custom matchers
// like toBeInTheDocument(), toHaveTextContent(), etc.
import '@testing-library/jest-dom';

// Clean up after each test to avoid test state leaking
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

// Mock window.confirm for delete confirmation tests
vi.stubGlobal('confirm', vi.fn(() => true));

// Mock fetch globally so API calls don't hit real endpoints
vi.stubGlobal('fetch', vi.fn());

// Suppress console.error noise during tests (optional: remove to see full logs)
vi.spyOn(console, 'error').mockImplementation(() => { });
