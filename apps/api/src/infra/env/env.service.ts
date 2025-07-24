import { Injectable } from '@nestjs/common'
import { env, EnvServer } from '@task-sync/env'

@Injectable()
export class EnvService {
  private readonly env: EnvServer

  constructor() {
    this.env = env
  }

  get<T extends keyof EnvServer>(key: T): EnvServer[T] {
    return this.env[key]
  }
}
