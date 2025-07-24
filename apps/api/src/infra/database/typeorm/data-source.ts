import { DataSource, type DataSourceOptions } from 'typeorm'

import { EnvService } from '../../env/env.service'
import typeOrmConfig from './typeorm.config'

const envService = new EnvService()

export default new DataSource(typeOrmConfig(envService) as DataSourceOptions)
