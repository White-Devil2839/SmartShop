module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'prettier', // disables ESLint rules that conflict with Prettier formatting
  ],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    // Catch real bugs
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_|next' }],
    'no-undef':       'error',
    'eqeqeq':         ['error', 'always'],
    'no-var':         'error',

    // Style preferences (enforced by Prettier for formatting; these are logic-level)
    'prefer-const':   'warn',
    'no-console':     'off', // console.log is fine in a backend service
  },
};
