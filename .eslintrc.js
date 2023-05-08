module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    'import/extensions': ['error', {
      js: 'always',
    }],
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
    'no-use-before-define': 0,
    'default-param-last': 0,
    'no-await-in-loop': 0,
    'consistent-return': 0,
    'guard-for-in': 0,
    'prefer-const': 0,
    'no-return-await': 0,
    'array-callback-return': 0,
  },
};
