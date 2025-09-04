import { Controller, Get, HttpCode } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { Public } from '@/infra/auth/decorators/public'
import { WinstonService } from '@/infra/logging/winston.service'

import { ApiZodResponse } from '../decorators/zod-openapi'

const loggingHealthCheckerResponseSchema = z.object({
  transports: z.array(
    z.object({
      name: z.string(),
      status: z.enum(['healthy', 'degraded', 'unhealthy']),
      lastError: z.string().optional(),
    }),
  ),
})

type LoggingHealthCheckerResponseSchema = z.infer<
  typeof loggingHealthCheckerResponseSchema
>

const loggingHealthCheckerResponseExample: LoggingHealthCheckerResponseSchema =
  {
    transports: [
      {
        name: 'Vector',
        status: 'healthy',
        lastError: 'Error message',
      },
    ],
  }

@ApiTags('health')
@Controller({ path: '/' })
@Public()
export class LoggingHealthCheckerController {
  constructor(private readonly winston: WinstonService) {}

  @Get('logging-health')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logging health check',
    description:
      'Check the health status of the logging application and get uptime information.',
  })
  @ApiZodResponse({
    status: 200,
    description: 'Logging application is healthy.',
    schema: loggingHealthCheckerResponseSchema,
    examples: loggingHealthCheckerResponseExample,
  })
  async handle() {
    return await this.winston.healthCheck()
  }
}
