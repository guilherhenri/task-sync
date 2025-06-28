import { type Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task, type TaskPriority } from '../../enterprise/entities/task'
import { TaskAttachment } from '../../enterprise/entities/task-attachment'
import type { TasksRepository } from '../repositories/tasks-repository'

interface CreateTaskUseCaseRequest {
  title: string
  description: string
  projectId: string
  assignedTo: Array<string>
  createdBy: string
  priority: TaskPriority
  dueDate?: Date
  tags: Array<string>
  attachmentsIds?: Array<string>
}

type CreateTaskUseCaseResponse = Either<Error, { task: Task }>

export class CreateTaskUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    title,
    description,
    projectId,
    assignedTo,
    createdBy,
    priority,
    dueDate,
    tags,
    attachmentsIds,
  }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
    if (dueDate && dueDate <= new Date()) {
      return left(new Error('Is not allowed past due date'))
    }

    const task = Task.create({
      title,
      description,
      projectId: new UniqueEntityID(projectId),
      assignedTo: assignedTo.map((id) => new UniqueEntityID(id)),
      createdBy: new UniqueEntityID(createdBy),
      priority,
      dueDate,
      tags,
    })

    const taskAttachments = (attachmentsIds ?? []).map((attachmentId) =>
      TaskAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        taskId: task.id,
      }),
    )

    task.attachments = taskAttachments

    await this.tasksRepository.create(task)

    return right({ task })
  }
}
