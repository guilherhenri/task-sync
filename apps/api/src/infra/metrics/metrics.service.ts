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

  private readonly businessEvents = new Counter({
    name: 'business_events_total',
    help: 'Business events',
    labelNames: ['action', 'resource', 'status'],
  })

  public recordBusinessEvents({
    action,
    resource,
    status,
  }: {
    action: string
    resource: string
    status: 'attempt' | 'failed' | 'success'
  }) {
    this.businessEvents.labels(action, resource, status).inc()
  }

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

  private readonly queueJobsTotal = new Counter({
    name: 'queue_jobs_total',
    help: 'Total queue jobs',
    labelNames: ['queue', 'operation', 'status'],
  })

  private readonly queueSize = new Gauge({
    name: 'queue_size_current',
    help: 'Current queue size',
    labelNames: ['queue', 'state'],
  })

  private readonly queueOperationDuration = new Histogram({
    name: 'queue_operation_duration_seconds',
    help: 'Queue operation duration',
    labelNames: ['queue', 'operation'],
  })

  private readonly externalApiCalls = new Counter({
    name: 'external_api_calls_total',
    help: 'Total external API calls',
    labelNames: ['service', 'endpoint', 'method', 'status_code'],
  })

  private readonly externalApiDuration = new Histogram({
    name: 'external_api_duration_seconds',
    help: 'External API call duration',
    labelNames: ['service', 'endpoint', 'method'],
  })

  private readonly workerJobsTotal = new Counter({
    name: 'worker_jobs_total',
    help: 'Total worker jobs processed',
    labelNames: ['worker', 'status'],
  })

  private readonly workerJobDuration = new Histogram({
    name: 'worker_job_duration_seconds',
    help: 'Worker job processing duration',
    labelNames: ['worker', 'result'],
  })

  constructor() {
    collectDefaultMetrics({ prefix: 'nodejs_' })
  }

  public recordWorkerJobMetrics({
    worker,
    status,
  }: {
    worker: string
    status:
      | 'started'
      | 'completed'
      | 'retry_started'
      | 'retry_succeeded'
      | 'failed'
      | 'dlq'
  }) {
    this.workerJobsTotal.labels(worker, status).inc()
  }

  public recordWorkerJobDuration({
    worker,
    result,
    duration,
  }: {
    worker: string
    result: 'completed' | 'failed'
    duration: number
  }) {
    this.workerJobDuration.labels(worker, result).observe(duration / 1000)
  }

  public recordDbMetrics({
    operation,
    table,
    duration,
    success,
  }: {
    operation: string
    table: string
    duration: number
    success: boolean
  }) {
    this.dbQueryDuration.labels(operation, table).observe(duration / 1000)
    this.dbQueryTotal
      .labels(operation, table, success ? 'success' : 'error')
      .inc()
  }

  public recordExternalApiMetrics({
    service,
    endpoint,
    method,
    statusCode,
    duration,
  }: {
    service: string
    endpoint: string
    method: string
    statusCode: number
    duration: number
  }) {
    this.externalApiCalls
      .labels(service, endpoint, method, statusCode.toString())
      .inc()
    this.externalApiDuration
      .labels(service, endpoint, method)
      .observe(duration / 1000)
  }

  public recordQueueMetrics({
    queue,
    operation,
    status,
    duration,
    size,
  }: {
    queue: string
    operation: string
    status: 'success' | 'error'
    duration: number
    size: number
  }) {
    this.queueJobsTotal.labels(queue, operation, status).inc()
    this.queueOperationDuration
      .labels(queue, operation)
      .observe(duration / 1000)
    this.queueSize.labels('email', 'waiting').set(size)
  }

  getMetrics() {
    return register.metrics()
  }
}
