import path, { dirname } from 'node:path'

import { swcDefaultsFactory } from '@nestjs/cli/lib/compiler/defaults/swc-defaults.js'
import TerserPlugin from 'terser-webpack-plugin'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const swcDefaultConfig = swcDefaultsFactory().swcOptions

export const module = {
  rules: [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: 'swc-loader',
        options: {
          ...swcDefaultConfig,
          jsc: {
            ...swcDefaultConfig.jsc,
            minify: {
              compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
              mangle: true,
            },
          },
        },
      },
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'swc-loader',
        options: swcDefaultConfig,
      },
    },
  ],
}

export const optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
        },
        mangle: {
          keep_fnames: false,
        },
        format: {
          comments: false,
        },
      },
      extractComments: false,
      parallel: true,
    }),
  ],
  sideEffects: false,
  usedExports: true,
}

export const resolve = {
  extensions: ['.ts', '.js'],
  alias: {
    '@/*': path.resolve(__dirname, 'src/*'),
  },
}

// Tree shaking optimization
export const mode = process.env.NODE_ENV || 'production'
