export interface UploadParams {
  fileName: string
  fileType: string
  body: Buffer
}

export abstract class FileStorage {
  abstract upload(params: UploadParams): Promise<{ url: string }>
  abstract delete(url: string): Promise<void>
}
