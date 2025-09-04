import * as fs from 'fs'
import * as path from 'path'
import * as winston from 'winston'

import { FileTransportConfig } from '../logging.types'

export const createFileTransport = (config: FileTransportConfig) => {
  const logDir = config.logDir ?? './logs'

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const createTypeFilter = (expectedType: string) =>
    winston.format((info) => {
      return info.type === expectedType ? info : false
    })

  const businessFilter = createTypeFilter('business_event')
  const securityFilter = createTypeFilter('security_event')
  const performanceFilter = createTypeFilter('performance')

  return [
    new winston.transports.File({
      level: config.level,
      filename: path.join(logDir, 'combined.log'),
      format: config.format,
      maxsize: parseSize(config.maxSize ?? '20m'),
      maxFiles: parseInt(config.maxFiles ?? '14', 10),
      tailable: true,
      zippedArchive: true,
    }),
    new winston.transports.File({
      level: 'error',
      filename: path.join(logDir, 'error.log'),
      format: config.format,
      maxsize: parseSize(config.maxSize || '20m'),
      maxFiles: parseInt(config.maxFiles || '30', 10),
      tailable: true,
      zippedArchive: true,
    }),
    new winston.transports.File({
      level: 'info',
      filename: path.join(logDir, 'business.log'),
      format: winston.format.combine(businessFilter(), config.format),
      maxsize: parseSize(config.maxSize || '20m'),
      maxFiles: parseInt(config.maxFiles || '14', 10),
      tailable: true,
      zippedArchive: true,
    }),
    new winston.transports.File({
      level: 'info',
      filename: path.join(logDir, 'security.log'),
      format: winston.format.combine(securityFilter(), config.format),
      maxsize: parseSize(config.maxSize || '20m'),
      maxFiles: parseInt(config.maxFiles || '30', 10),
      tailable: true,
      zippedArchive: true,
    }),
    new winston.transports.File({
      level: 'info',
      filename: path.join(logDir, 'performance.log'),
      format: winston.format.combine(performanceFilter(), config.format),
      maxsize: parseSize(config.maxSize ?? '20m'),
      maxFiles: parseInt(config.maxFiles ?? '7', 10),
      tailable: true,
      zippedArchive: true,
    }),
  ]
}

function parseSize(sizeStr: string): number {
  const size = sizeStr.toLowerCase()
  const num = parseFloat(size)

  if (size.includes('k')) {
    return num * 1024
  } else if (size.includes('m')) {
    return num * 1024 * 1024
  } else if (size.includes('g')) {
    return num * 1024 * 1024 * 1024
  }

  return num
}
