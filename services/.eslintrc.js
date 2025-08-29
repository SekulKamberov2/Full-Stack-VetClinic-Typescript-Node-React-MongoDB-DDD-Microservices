module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // Base rules that apply to all packages
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
  },
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  overrides: [
    {
      // Package-specific configurations can go here
      files: ['packages/*/src/**/*.ts'],
      rules: {
        // Package-specific rules
      },
    },
  ],
};