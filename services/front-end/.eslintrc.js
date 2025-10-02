module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
