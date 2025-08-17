import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class TypeOrmService
  extends DataSource
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super(dataSource.options)
  }

  async onModuleInit() {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  async onModuleDestroy() {
    if (this.isInitialized) {
      await this.destroy()
    }
  }
}
