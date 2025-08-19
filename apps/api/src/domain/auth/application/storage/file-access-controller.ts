export abstract class FileAccessController {
  abstract getSignedUrl(key: string, expiresIn?: number): Promise<string>
}
