import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
    // Apply to all JS files under src/ and tests/
    {
        files: ['src/**/*.js', 'tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                // Node.js core globals
                require:        'readonly',
                module:         'writable',
                exports:        'writable',
                __dirname:      'readonly',
                __filename:     'readonly',
                process:        'readonly',
                console:        'readonly',
                Buffer:         'readonly',
                setTimeout:     'readonly',
                clearTimeout:   'readonly',
                setInterval:    'readonly',
                clearInterval:  'readonly',
                // Web/WHATWG APIs available in Node >= 18
                URL:            'readonly',
                URLSearchParams:'readonly',
                fetch:          'readonly',
                Headers:        'readonly',
                Request:        'readonly',
                Response:       'readonly',
                // Jest globals (used in tests/)
                describe:       'readonly',
                it:             'readonly',
                test:           'readonly',
                expect:         'readonly',
                beforeAll:      'readonly',
                afterAll:       'readonly',
                beforeEach:     'readonly',
                afterEach:      'readonly',
                jest:           'readonly',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_|next' }],
            'no-console':     'off',
            'eqeqeq':         ['error', 'always'],
            'no-var':         'error',
            'prefer-const':   'warn',
        },
    },
    // Prettier must be last — disables formatting rules that conflict
    prettier,
];
