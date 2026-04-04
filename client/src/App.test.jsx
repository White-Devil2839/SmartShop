import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

describe('App', () => {
    it('renders the SmartShop brand link', () => {
        // Mock fetch so AuthContext and product loading don't hit real endpoints
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: 'ok', message: 'Test Msg', timestamp: 'now' }),
            })
        );

        render(<App />);

        // The brand is rendered as an anchor whose accessible name includes "SmartShop"
        // (the emoji lives in a text node; the brand name lives in a child <span>).
        // getByRole correctly computes the full accessible name of the element.
        const brandLink = screen.getByRole('link', { name: /SmartShop/i });
        expect(brandLink).toBeInTheDocument();
    });
});
