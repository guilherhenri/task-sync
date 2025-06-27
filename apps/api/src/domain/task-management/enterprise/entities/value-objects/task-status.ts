export type Status = 'todo' | 'in_progress' | 'review' | 'done'

export class TaskStatus {
  public value: Status

  constructor(value?: Status) {
    this.value = value ?? 'todo'
  }

  /**
   * Returns the next status in the task lifecycle.
   *
   * @param {Status} actualStatus - The current status.
   * @returns {TaskStatus} The next status in the sequence.
   * @throws {Error} If the current status is 'done' (no next status available).
   */
  static getNextStatus(actualStatus: Status): TaskStatus {
    if (actualStatus === 'done') {
      throw new Error('Cannot get next status for a completed task')
    }

    const transitions: Record<Exclude<Status, 'done'>, Status> = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'done',
    }

    return new TaskStatus(transitions[actualStatus])
  }
}
