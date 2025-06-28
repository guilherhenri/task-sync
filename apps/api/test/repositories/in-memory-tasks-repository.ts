import type { TasksRepository } from '@/domain/task-management/application/repositories/tasks-repository'
import type { Task } from '@/domain/task-management/enterprise/entities/task'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []

  async create(task: Task): Promise<void> {
    this.items.push(task)
  }
}
