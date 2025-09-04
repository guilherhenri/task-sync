import * as http from 'http'
import * as https from 'https'
import * as winston from 'winston'
import Transport from 'winston-transport'

import { ExternalTransportConfig } from '../logging.types'

class CircuitBreaker {
  private failures = 0
  private lastFailureTime?: number
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeout = 30000,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN' && this.shouldTryAgain()) {
      this.state = 'HALF_OPEN'
    }

    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN')
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private shouldTryAgain(): boolean {
    return this.lastFailureTime
      ? Date.now() - this.lastFailureTime > this.resetTimeout
      : true
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }
}

class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(
    private readonly capacity: number,
    private readonly fillPerSecond: number,
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  tryConsume(tokens: number): boolean {
    this.refill()

    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }
    return false
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const tokensToAdd = elapsed * this.fillPerSecond

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}

class VectorTransport extends Transport {
  private endpoint: string
  private timeout: number
  private batchSize: number
  private batchTimeout: number
  private maxBatchSize: number
  private maxRetries: number
  private batch: winston.Logform.TransformableInfo[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private failedBatches: Array<{
    batch: winston.Logform.TransformableInfo[]
    attempts: number
  }> = []

  private circuitBreaker: CircuitBreaker

  constructor(
    options: ExternalTransportConfig & {
      maxBatchSize?: number
      maxRetries?: number
    },
  ) {
    super(options)

    this.endpoint = options.vectorEndpoint
    this.timeout = options.vectorTimeout
    this.batchSize = options.batchSize || 10
    this.batchTimeout = options.batchTimeout || 5000
    this.maxBatchSize = options.maxBatchSize || 100
    this.maxRetries = options.maxRetries || 3

    this.circuitBreaker = new CircuitBreaker()
  }

  log(info: winston.Logform.TransformableInfo, callback: () => void): void {
    setImmediate(() => this.emit('logged', info))

    if (this.batch.length >= this.maxBatchSize) {
      this.sendBatch()
        .then(() => {
          this.batch.push(info)
          this.scheduleBatchSend()
        })
        .catch(() => {
          this.emit('warn', new Error('Failed to send batch, dropping log'))
        })
    } else {
      this.batch.push(info)
      this.scheduleBatchSend()
    }

    callback()
  }

  private scheduleBatchSend(): void {
    if (this.batch.length >= this.batchSize) {
      this.sendBatch()
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.sendBatch()
      }, this.batchTimeout)
    }
  }

  private async sendBatch(): Promise<void> {
    if (this.batch.length === 0) return

    const batch = [...this.batch]
    const batchSize = batch.length
    const startTime = Date.now()

    this.batch = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      await this.sendToVector(batch)
      const duration = Date.now() - startTime

      this.emit('info', 'Batch sent successfully', {
        type: 'performance',
        operation: 'batch_send',
        duration,
        success: true,
        metadata: {
          batchSize,
          endpoint: this.endpoint,
        },
      })
    } catch (error) {
      const duration = Date.now() - startTime

      this.emit('warn', 'Batch send failed', {
        type: 'performance',
        operation: 'batch_send',
        duration,
        success: false,
        metadata: {
          batchSize,
          endpoint: this.endpoint,
          error: (error as Error).message,
        },
      })

      await this.handleFailedBatch(batch, error as Error)
    }
  }

  private async handleFailedBatch(
    batch: winston.Logform.TransformableInfo[],
    error: Error,
  ): Promise<void> {
    const existingFailure = this.failedBatches.find((f) => f.batch === batch)
    const attempts = existingFailure ? existingFailure.attempts + 1 : 1

    if (attempts < this.maxRetries) {
      if (existingFailure) {
        existingFailure.attempts = attempts
      } else {
        this.failedBatches.push({ batch, attempts })
      }

      const delay = Math.pow(2, attempts) * 1000

      setTimeout(() => {
        this.retryFailedBatch(batch)
      }, delay)
    } else {
      this.failedBatches = this.failedBatches.filter((f) => f.batch !== batch)
      this.emit(
        'error',
        new Error(`Batch failed after ${attempts} attempts: ${error.message}`),
      )
    }
  }

  private async retryFailedBatch(
    batch: winston.Logform.TransformableInfo[],
  ): Promise<void> {
    try {
      await this.sendToVector(batch)

      this.failedBatches = this.failedBatches.filter((f) => f.batch !== batch)
    } catch (error) {
      await this.handleFailedBatch(batch, error as Error)
    }
  }

  private sendToVector(logs: unknown[]): Promise<void> {
    return this.circuitBreaker.execute(async () => {
      return new Promise<void>((resolve, reject) => {
        const url = new URL(this.endpoint)
        const isHttps = url.protocol === 'https:'
        const client = isHttps ? https : http

        const postData = JSON.stringify({
          logs,
          timestamp: new Date().toISOString(),
          source: 'task-sync-api',
        })

        const options = {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'winston-vector-transport/1.0.0',
          },
          timeout: this.timeout,
        }

        const req = client.request(options, (res) => {
          let data = ''

          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('error', reject)

          res.on('end', () => {
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              resolve()
            } else {
              reject(
                new Error(
                  `Vector responded with status ${res.statusCode}: ${data}`,
                ),
              )
            }
          })
        })

        req.on('error', reject)
        req.on('timeout', () => {
          req.destroy()
          reject(
            new Error(`Request to Vector timed out after ${this.timeout}ms`),
          )
        })

        req.write(postData)
        req.end()
      })
    })
  }

  close(): void {
    if (this.batch.length > 0) {
      this.sendBatch()
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
  }
}

class RateLimitingVectorTransport extends VectorTransport {
  private tokenBucket = new TokenBucket(1000, 100)

  log(info: winston.Logform.TransformableInfo, callback: () => void): void {
    if (!this.tokenBucket.tryConsume(1)) {
      this.emit('warn', new Error('Log rate limit exceeded'))
      return callback()
    }

    super.log(info, callback)
  }
}

export const createExternalTransport = (config: ExternalTransportConfig) => {
  return new RateLimitingVectorTransport(config)
}
