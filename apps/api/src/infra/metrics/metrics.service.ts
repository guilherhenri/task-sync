import { Injectable } from '@nestjs/common'
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  register,
} from 'prom-client'

@Injectable()
export class MetricsService {
  public readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  })

  public readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  })

  public readonly businessEvents = new Counter({
    name: 'business_events_total',
    help: 'Business events',
    labelNames: ['action', 'resource', 'status'],
  })

  public readonly useCaseExecutions = new Counter({
    name: 'use_case_executions_total',
    help: 'Total number of use case executions',
    labelNames: ['use_case', 'status'],
  })

  public readonly useCaseDuration = new Histogram({
    name: 'use_case_duration_seconds',
    help: 'Use case execution duration in seconds',
    labelNames: ['use_case', 'status'],
    buckets: [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  })

  public readonly databaseOperations = new Counter({
    name: 'database_operations_total',
    help: 'Total number of database operations',
    labelNames: ['operation', 'table', 'status'],
  })

  public readonly databaseConnections = new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
    labelNames: ['database'],
  })

  public readonly dbQueryDuration = new Histogram({
    name: 'db_query_duration_seconds',
    help: 'Database query duration',
    labelNames: ['operation', 'table'],
  })

  public readonly dbQueryTotal = new Counter({
    name: 'db_queries_total',
    help: 'Total database queries',
    labelNames: ['operation', 'table', 'status'],
  })

  public readonly queueJobsTotal = new Counter({
    name: 'queue_jobs_total',
    help: 'Total queue jobs',
    labelNames: ['queue', 'operation', 'status'],
  })

  public readonly queueSize = new Gauge({
    name: 'queue_size_current',
    help: 'Current queue size',
    labelNames: ['queue', 'state'],
  })

  public readonly queueOperationDuration = new Histogram({
    name: 'queue_operation_duration_seconds',
    help: 'Queue operation duration',
    labelNames: ['queue', 'operation'],
  })

  constructor() {
    collectDefaultMetrics({ prefix: 'nodejs_' })
  }

  public recordDbMetrics(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
  ) {
    this.dbQueryDuration.labels(operation, table).observe(duration / 1000)
    this.dbQueryTotal
      .labels(operation, table, success ? 'success' : 'error')
      .inc()
  }

  getMetrics() {
    return register.metrics()
  }
}
