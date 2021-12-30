module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },

  env: {
    browser: true,
  },

  extends: ['eslint:recommended', 'prettier'],

  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'prefer-promise-reject-errors': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
