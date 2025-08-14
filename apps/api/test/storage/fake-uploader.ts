import { randomUUID } from 'crypto'

import type {
  FileStorage,
  UploadParams,
} from '@/domain/auth/application/storage/file-storage'

interface Upload {
  fileName: string
  url: string
}

export class FakeUploader implements FileStorage {
  public uploads: Upload[] = []

  async upload({ fileName }: UploadParams): Promise<{ url: string }> {
    const url = randomUUID()

    this.uploads.push({
      fileName,
      url,
    })

    return { url }
  }

  async delete(url: string): Promise<void> {
    this.uploads = this.uploads.filter((upload) => upload.url !== url)
  }
}
