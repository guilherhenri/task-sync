import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  external: ['react', 'lit-element'],
  outDir: 'dist',
  dts: true,
  clean: true,
  esbuildPlugins: [
    sassPlugin({
      type: 'lit-css',
    }),
  ],
})
