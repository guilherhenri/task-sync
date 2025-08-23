import chalk from 'chalk'
import * as winston from 'winston'

import { LogInfo, LogLevel } from '../logging.types'

export const developmentFormatter = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const {
      timestamp,
      level,
      message,
      service,
      correlationId,
      type,
      stack,
      metadata,
    } = info as LogInfo

    const levelColors: Record<LogLevel, typeof chalk> = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.green,
      http: chalk.magenta,
      verbose: chalk.cyan,
      debug: chalk.blue,
      silly: chalk.gray,
    }

    const colorFn = levelColors[level] ?? chalk.white

    const formattedTime = chalk.gray(timestamp)
    const formattedLevel = colorFn(level.toUpperCase().padEnd(7))
    const serviceInfo = chalk.cyan(`[${service}]`)

    const corrId = correlationId
      ? chalk.magenta(`[${correlationId.slice(0, 8)}]`)
      : ''

    const formattedMessage = colorFn(message)
    const typeInfo = type ? chalk.blue(`[${type}]`) : ''

    let logLine = `${formattedTime} ${formattedLevel} ${serviceInfo} ${corrId} ${typeInfo} ${formattedMessage}`

    if (metadata && Object.keys(metadata).length > 0) {
      logLine +=
        '\n' + chalk.gray('  Metadata: ') + JSON.stringify(metadata, null, 2)
    }

    if (stack) {
      logLine += '\n' + chalk.red(stack)
    }

    return logLine
  }),
)
