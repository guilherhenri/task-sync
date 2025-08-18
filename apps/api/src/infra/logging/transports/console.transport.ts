import { transports } from 'winston'

import { EnvService } from '@/infra/env/env.service'

import { ConsoleTransportConfig } from '../logging.types'

export const createConsoleTransport = (config: ConsoleTransportConfig) => {
  const envService = new EnvService()

  return new transports.Console({
    level: config.level,
    format: config.format,
    silent: config.silent ?? envService.get('NODE_ENV') === 'test',
    stderrLevels: ['error', 'warn'],
    consoleWarnLevels: ['warn'],
    handleExceptions: true,
    handleRejections: true,
  })
}
