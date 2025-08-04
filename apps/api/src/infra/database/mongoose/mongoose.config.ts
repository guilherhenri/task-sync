import { MongooseModuleOptions } from '@nestjs/mongoose'

import type { EnvService } from '@/infra/env/env.service'

export const mongooseConfig = async (
  envService: EnvService,
): Promise<MongooseModuleOptions> => {
  const uri = envService.get('MONGO_URI')

  return {
    uri,
    dbName: envService.get('MONGO_DB'),
    auth: {
      username: envService.get('MONGO_USERNAME'),
      password: envService.get('MONGO_PASSWORD'),
    },
  }
}
