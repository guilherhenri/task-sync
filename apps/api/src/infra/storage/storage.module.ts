import { Module } from '@nestjs/common'

import { FileAccessController } from '@/domain/auth/application/storage/file-access-controller'
import { FileStorage } from '@/domain/auth/application/storage/file-storage'

import { EnvModule } from '../env/env.module'
import { ObservabilityModule } from '../observability/observability.module'
import { SupabaseStorage } from './supabase-storage'

@Module({
  imports: [EnvModule, ObservabilityModule],
  providers: [
    {
      provide: FileStorage,
      useClass: SupabaseStorage,
    },
    {
      provide: FileAccessController,
      useClass: SupabaseStorage,
    },
  ],
  exports: [FileStorage, FileAccessController],
})
export class StorageModule {}
