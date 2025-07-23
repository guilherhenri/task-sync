import { swcDefaultsFactory } from '@nestjs/cli/lib/compiler/defaults/swc-defaults.js'
import TerserPlugin from 'terser-webpack-plugin'

const swcDefaultConfig = swcDefaultsFactory().swcOptions

export const module = {
  rules: [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: 'swc-loader',
        options: swcDefaultConfig,
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
  minimizer: [new TerserPlugin()],
}
