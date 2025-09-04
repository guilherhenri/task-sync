import { Global, Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'

import { LoggerPort } from '@/core/ports/logger'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { LoggingConfig } from './logging.types'
import { createWinstonConfig } from './winston.config'
import { WinstonService } from './winston.service'

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (configService: EnvService) => {
        const config: LoggingConfig = {
          level: configService.get('LOG_LEVEL'),
          environment: configService.get('NODE_ENV'),
          service: 'task-sync-api',
          version: configService.get('APP_VERSION'),
          enableConsole: configService.get('LOG_ENABLE_CONSOLE'),
          enableFile: configService.get('LOG_ENABLE_FILE'),
          enableExternal: configService.get('LOG_ENABLE_EXTERNAL'),
          fileConfig: {
            logDir: configService.get('LOG_DIR'),
            maxSize: configService.get('LOG_MAX_SIZE'),
            maxFiles: configService.get('LOG_MAX_FILES'),
          },
          externalConfig: configService.get('LOG_ENABLE_EXTERNAL')
            ? {
                vectorEndpoint: configService.get('VECTOR_ENDPOINT'),
                vectorTimeout: parseInt(
                  configService.get('VECTOR_TIMEOUT'),
                  10,
                ),
              }
            : undefined,
        }

        return createWinstonConfig(config)
      },
    }),
    EnvModule,
  ],
  providers: [
    { provide: LoggerPort, useClass: WinstonService },
    WinstonService,
  ],
  exports: [LoggerPort, WinstonService],
})
export class LoggingModule {}
