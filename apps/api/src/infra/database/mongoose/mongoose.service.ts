import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { type Connection, ConnectionStates } from 'mongoose'

@Injectable()
export class MongooseService implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectConnection() private readonly _connection: Connection) {}

  get connection(): Connection {
    return this._connection
  }

  async onModuleInit() {
    if (this.connection.readyState === 0) {
      await this.connection.asPromise()
    }
  }

  async onModuleDestroy() {
    if (this.connection.readyState === 1) {
      await this.connection.close()
    }
  }

  getConnectionStatus(): string {
    const states: Record<ConnectionStates, string> = {
      [ConnectionStates.disconnected]: 'Disconnected',
      [ConnectionStates.connected]: 'Connected',
      [ConnectionStates.connecting]: 'Connecting',
      [ConnectionStates.disconnecting]: 'Disconnecting',
      [ConnectionStates.uninitialized]: 'Uninitialized',
    }

    return states[this.connection.readyState] || 'Unknown'
  }
}
