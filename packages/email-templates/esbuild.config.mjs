import { build } from 'esbuild'

const buildConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/index.js',
  minify: true,
  external: [
    'react',
    'react-dom',
    'react-dom/server',
    'react-dom/client',
    'prettier',
    '@react-email/components',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  keepNames: true,
  sourcemap: false,
}

build(buildConfig).catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
