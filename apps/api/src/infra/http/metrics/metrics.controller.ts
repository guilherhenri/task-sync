import { Controller, Get, Header } from '@nestjs/common'

import { Public } from '@/infra/auth/decorators/public'
import { MetricsService } from '@/infra/metrics/metrics.service'

@Controller('/metrics')
@Public()
export class MetricsController {
  constructor(private readonly metric: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async handle(): Promise<string> {
    return this.metric.getMetrics()
  }
}
