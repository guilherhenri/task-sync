import { execSync } from 'node:child_process'

import { migrationsDir } from '../src/infra/database/typeorm/typeorm.config'

const migrationName = process.argv[2]

if (!migrationName) {
  console.error('Migration name is required')
  process.exit(1)
}

const command = `pnpm typeorm migration:generate "${migrationsDir}/${migrationName}"`

execSync(command, { stdio: 'inherit' })
