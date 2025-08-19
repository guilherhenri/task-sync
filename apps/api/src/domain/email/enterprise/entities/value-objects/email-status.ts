export type Status = 'pending' | 'processing' | 'sent' | 'failed'

export class EmailStatus {
  public value: Status

  constructor(value?: Status) {
    this.value = value ?? 'pending'
  }

  /**
   * Returns the next status in the email lifecycle.
   *
   * @param {Status} actualStatus - The current status.
   * @returns {TaskStatus} The next status in the sequence.
   * @throws {Error} If the current status is 'sent' or 'failed' (no next status available).
   */
  static getNextStatus(actualStatus: Status): EmailStatus {
    if (actualStatus === 'sent') {
      throw new Error('Cannot get next status for a sent email')
    }

    if (actualStatus === 'failed') {
      throw new Error('Cannot get next status for a failed email')
    }

    const transitions: Record<Exclude<Status, 'sent' | 'failed'>, Status> = {
      pending: 'processing',
      processing: 'sent',
    }

    return new EmailStatus(transitions[actualStatus])
  }
}
