import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
    rules: {
      quotes: ['warn', 'single'],
      'prettier/prettier': ['warn', { singleQuote: true, printWidth: 120, parser: 'flow', endOfLine: 'lf' }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  pluginJs.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
  },
];
