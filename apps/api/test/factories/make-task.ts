import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Task,
  type TaskProps,
} from '@/domain/task-management/enterprise/entities/task'

export function makeTask(
  override: Partial<TaskProps> = {},
  id?: UniqueEntityID,
) {
  const task = Task.create(
    {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      projectId: new UniqueEntityID(),
      assignedTo: Array.from({ length: 2 }).map(() => new UniqueEntityID()),
      createdBy: new UniqueEntityID(),
      priority: 'medium',
      tags: faker.word.words(3).split(' '),
      ...override,
    },
    id,
  )

  return task
}
