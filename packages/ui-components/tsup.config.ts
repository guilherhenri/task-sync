import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  external: ['react', '@radix-ui/react-checkbox'],
  outDir: 'dist',
  dts: true,
  clean: true,
  esbuildPlugins: [sassPlugin()],
})
