import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import { Slug } from './value-objects/slug'
import { TaskStatus } from './value-objects/task-status'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TaskProps {
  title: string
  slug: Slug
  description: string
  projectId: UniqueEntityID
  assignedTo: Array<UniqueEntityID>
  createdBy: UniqueEntityID
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  completedAt?: Date
  tags: Array<string>
  createdAt: Date
  updatedAt?: Date
}

export class Task extends Entity<TaskProps> {
  /**
   * Gets the title of the task.
   * @returns {string} The task title.
   */
  get title(): string {
    return this.props.title
  }

  /**
   * Sets the task title and updates the slug accordingly.
   * @param {string} title - The new title for the task.
   */
  set title(title: string) {
    this.props.title = title
    this.props.slug = Slug.createFromText(title)
    this.touch()
  }

  get slug() {
    return this.props.slug
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
    this.touch()
  }

  get projectId() {
    return this.props.projectId
  }

  get assignedTo() {
    return this.props.assignedTo
  }

  set assignedTo(assignedTo: Array<UniqueEntityID>) {
    this.props.assignedTo = assignedTo
    this.touch()
  }

  get createdBy() {
    return this.props.createdBy
  }

  /**
   * Gets the current status of the task.
   * @returns {TaskStatus} The task status.
   */
  get status(): TaskStatus {
    return this.props.status
  }

  /**
   * Sets the task status and updates completedAt if status is 'done'.
   * @param {TaskStatus} status - The new status for the task.
   */
  set status(status: TaskStatus) {
    this.props.status = status
    this.props.completedAt = status.value === 'done' ? new Date() : undefined
    this.touch()
  }

  get priority() {
    return this.props.priority
  }

  set priority(priority: TaskPriority) {
    this.props.priority = priority
    this.touch()
  }

  get dueDate() {
    return this.props.dueDate
  }

  set dueDate(dueDate: Date | null) {
    this.props.dueDate = dueDate
    this.touch()
  }

  get completedAt() {
    return this.props.completedAt
  }

  get tags() {
    return this.props.tags
  }

  set tags(tags: Array<string>) {
    this.props.tags = [...new Set(tags.filter((tag) => tag.trim() !== ''))]
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  /**
   * Checks if the task is overdue and not completed.
   * @returns {boolean} True if the task has a due date, is not completed, and the due date has passed.
   */
  get isOverdueAndNotCompleted(): boolean {
    if (!this.dueDate) return false

    const now = new Date()

    return this.status.value !== 'done' && now > this.dueDate
  }

  /**
   * Checks if the task was completed after its due date.
   * @returns {boolean} True if the task is completed and the completion date is after the due date.
   */
  get isCompletedLate(): boolean {
    if (!this.dueDate || !this.completedAt) return false

    return this.status.value === 'done' && this.completedAt > this.dueDate
  }

  /**
   * Checks if the task is either overdue and not completed or completed late.
   * @returns {boolean} True if the task is overdue in any form.
   */
  get isOverdue(): boolean {
    return this.isOverdueAndNotCompleted || this.isCompletedLate
  }

  protected touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<TaskProps, 'slug' | 'status' | 'dueDate' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const task = new Task(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        status: new TaskStatus(),
        dueDate: props.dueDate ?? null,
        tags: [...new Set(props.tags.filter((tag) => tag.trim() !== ''))],
        createdAt: new Date(),
      },
      id,
    )

    return task
  }
}
