import type { DataSource } from 'typeorm'
import type { Seeder, SeederFactoryManager } from 'typeorm-extension'

import { User } from '../entities/user.entity'

export default class UserSeeder implements Seeder {
  track = false

  public async run(_: DataSource, factoryManager: SeederFactoryManager) {
    console.log('UserSeeder Running')

    const userFactory = factoryManager.get(User)

    await userFactory.saveMany(10)
  }
}
