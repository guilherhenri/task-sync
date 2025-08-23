import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import prettierPlugin from 'eslint-plugin-prettier'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default tseslint.config(
  { ignores: ['dist/**'] },
  {
    extends: [
      js.configs.recommended,
      ...compat.extends('@rocketseat/eslint-config/react'),
      ...compat.extends('prettier'),
    ],
    files: ['**/*.{ts,tsx}', '**/*.{js,jsx}'],
    plugins: {
      turbo: turboPlugin,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      prettier: prettierPlugin,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'turbo/no-undeclared-env-vars': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prettier/prettier': 'error',
      'no-new': 'off',
    },
  },
)
