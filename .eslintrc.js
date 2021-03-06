module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  extends: ['prettier'],
  plugins: ['@typescript-eslint', 'import', 'prettier', 'filenames'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        bracketSameLine: true,
        arrowParens: 'avoid',
        endOfLine: 'auto',
      },
    ],
    'array-bracket-spacing': ['error', 'never'],
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/semi': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'comma-dangle': [
      'error',
      {
        imports: 'only-multiline',
        objects: 'only-multiline',
        arrays: 'only-multiline',
        functions: 'ignore',
        exports: 'ignore',
      },
    ],
    curly: 'warn',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: ['error', 'always'],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'index',
          'sibling',
          'parent',
          'type',
          'object',
        ],
      },
    ],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'no-console': 'error',
    'filenames/match-exported': ['error', ['kebab', 'camel', 'pascal']],
  },
  ignorePatterns: ['out', 'dist', '**/*.d.ts'],
};
