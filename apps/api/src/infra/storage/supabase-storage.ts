import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { FileAccessController } from '@/domain/auth/application/storage/file-access-controller'
import type {
  FileStorage,
  UploadParams,
} from '@/domain/auth/application/storage/file-storage'

import { EnvService } from '../env/env.service'
import { ObservableService } from '../observability/observable-service'

export interface SupabaseUploadResult {
  url: string
  path: string
  publicUrl?: string
}

@Injectable()
export class SupabaseStorage
  extends ObservableService
  implements FileStorage, FileAccessController
{
  private client: SupabaseClient
  private bucketName: string

  constructor(private readonly envService: EnvService) {
    super()

    const supabaseUrl = envService.get('SUPABASE_URL')
    const supabaseKey = envService.get('SUPABASE_SERVICE_ROLE_KEY')
    this.bucketName = envService.get('SUPABASE_STORAGE_BUCKET')

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  private validateFileType(fileType: string): void {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
    ]

    if (!allowedTypes.includes(fileType)) {
      throw new Error(`File type not allowed: ${fileType}`)
    }
  }

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<{ url: string }> {
    return this.trackOperation(
      async () => {
        const uploadId = randomUUID()
        const fileExtension = fileName.split('.').pop()
        const uniqueFileName = `${uploadId}-${Date.now()}.${fileExtension}`

        this.validateFileType(fileType)

        const { data, error } = await this.client.storage
          .from(this.bucketName)
          .upload(uniqueFileName, body, {
            contentType: fileType,
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          throw new Error(`Fail to upload file: ${error.message}`)
        }

        return {
          url: data.path,
        }
      },
      { service: 'supabase_storage', endpoint: '/upload', method: 'POST' },
    )
  }

  async delete(filePath: string): Promise<void> {
    await this.trackOperation(
      async () => {
        const { error } = await this.client.storage
          .from(this.bucketName)
          .remove([filePath])

        if (error) {
          throw new Error(`Falha ao deletar arquivo: ${error.message}`)
        }
      },
      { service: 'supabase_storage', endpoint: '/delete', method: 'DELETE' },
    )
  }

  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    return this.trackOperation(
      async () => {
        const { data, error } = await this.client.storage
          .from(this.bucketName)
          .createSignedUrl(filePath, expiresIn)

        if (error) {
          throw new Error(`Erro ao gerar URL assinada: ${error.message}`)
        }

        return data.signedUrl
      },
      { service: 'supabase_storage', endpoint: '/download', method: 'GET' },
    )
  }
}
