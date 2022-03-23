module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },

  overrides: [
    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      globals: {
        wallet: 'readonly',
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};
