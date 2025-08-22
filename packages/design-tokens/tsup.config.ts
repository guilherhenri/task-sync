import { writeFileSync } from 'node:fs'

import { defineConfig } from 'tsup'

import * as tokens from './src'

type TokenValue = string | number | { [key: string]: TokenValue }

function toKebabCase(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function generateScssVars(obj: TokenValue, prefix = ''): string[] {
  const vars: string[] = []

  if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      const varName = prefix
        ? `${toKebabCase(prefix)}-${toKebabCase(key)}`
        : toKebabCase(key)

      const adjustedVarName = varName.replace(/\./g, '-')

      if (typeof value === 'object' && value !== null) {
        vars.push(...generateScssVars(value, adjustedVarName))
      } else {
        vars.push(`$${adjustedVarName}: ${value};`)
      }
    })
  }

  return vars
}

function generateScssTokens() {
  const scssVars = Object.entries(tokens)
    .map(([key, value]) => generateScssVars(value, toKebabCase(key)))
    .flat()
    .join('\n')

  writeFileSync('dist/tokens.scss', scssVars)
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  dts: true,
  onSuccess: async () => {
    generateScssTokens()
  },
})
