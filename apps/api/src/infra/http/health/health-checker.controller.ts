import { Controller, Get, HttpCode } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { Public } from '@/infra/auth/decorators/public'

import { ApiZodResponse } from '../decorators/zod-openapi'

const healthCheckerResponseSchema = z.object({
  status: z.literal('healthy'),
  details: z.object({
    uptime: z.number(),
    timestamp: z.string(),
  }),
})

type HealthCheckerResponseSchema = z.infer<typeof healthCheckerResponseSchema>

const healthCheckerResponseExample: HealthCheckerResponseSchema = {
  status: 'healthy',
  details: {
    uptime: 3600.123,
    timestamp: '2025-08-16T10:30:00.000Z',
  },
}

@ApiTags('health')
@Controller({ path: '/' })
@Public()
export class HealthCheckerController {
  @Get('health')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health check',
    description:
      'Check the health status of the application and get uptime information.',
  })
  @ApiZodResponse({
    status: 200,
    description: 'Application is healthy.',
    schema: healthCheckerResponseSchema,
    examples: healthCheckerResponseExample,
  })
  handle() {
    return {
      status: 'healthy',
      details: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    }
  }
}
