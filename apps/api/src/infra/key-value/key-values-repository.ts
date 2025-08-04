export abstract class KeyValuesRepository {
  abstract lpush(queue: string, value: string): Promise<void>
  abstract publish(channel: string, message: string): Promise<void>
}
