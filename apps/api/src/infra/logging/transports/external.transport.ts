import * as http from 'http'
import * as https from 'https'
import * as winston from 'winston'
import Transport from 'winston-transport'

import { ExternalTransportConfig } from '../logging.types'

class VectorTransport extends Transport {
  private endpoint: string
  private timeout: number
  private batchSize: number
  private batchTimeout: number
  private batch: winston.Logform.TransformableInfo[] = []
  private batchTimer: NodeJS.Timeout | null = null

  constructor(options: ExternalTransportConfig) {
    super(options)

    this.endpoint = options.vectorEndpoint
    this.timeout = options.vectorTimeout
    this.batchSize = options.batchSize || 10
    this.batchTimeout = options.batchTimeout || 5000
  }

  log(info: winston.Logform.TransformableInfo, callback: () => void): void {
    setImmediate(() => this.emit('logged', info))

    this.batch.push(info)

    if (this.batch.length >= this.batchSize) {
      this.sendBatch()
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.sendBatch()
      }, this.batchTimeout)
    }

    callback()
  }

  private async sendBatch(): Promise<void> {
    if (this.batch.length === 0) return

    const batch = [...this.batch]
    this.batch = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      await this.sendToVector(batch)
    } catch (error) {
      this.batch.unshift(...batch)
      this.emit('error', error)
    }
  }

  private sendToVector(logs: unknown[]): Promise<void> {
    return new Promise((resolve, reject) => {
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

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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

      req.on('error', (error) => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error(`Request to Vector timed out after ${this.timeout}ms`))
      })

      req.write(postData)
      req.end()
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

export const createExternalTransport = (config: ExternalTransportConfig) => {
  return new VectorTransport(config)
}
