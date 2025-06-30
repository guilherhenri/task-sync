export interface TokenService {
  save(key: string, value: string, ttlSeconds: number): Promise<void>
  get(key: string): Promise<string | null>
  delete(key: string): Promise<void>
}
