import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Enable using legacy eslintrc-style shareable configs with ESLint v9 flat config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // Ignore TS auth prototype stack entirely for now
  { ignores: ['**/src/context/auth/**'] },
  // Bring in Expo's recommended config via compat
  ...compat.extends('eslint-config-expo'),
  // Project-specific overrides
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
    ignores: [
      'node_modules',
      'dist',
      'build',
      '.expo',
      '.expo-shared',
    ],
  },
];
