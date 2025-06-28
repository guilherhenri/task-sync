import { InMemoryTasksRepository } from '@test/repositories/in-memory-tasks-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CreateTaskUseCase } from './create-task'

let inMemoryTasksRepository: InMemoryTasksRepository
let sut: CreateTaskUseCase

describe('Create Task Use-case', () => {
  beforeEach(() => {
    inMemoryTasksRepository = new InMemoryTasksRepository()
    sut = new CreateTaskUseCase(inMemoryTasksRepository)
  })

  it('should be able to create a task', async () => {
    const response = await sut.execute({
      title: 'New Task',
      description: 'A task for tests',
      projectId: 'project-id',
      assignedTo: ['2', '3'],
      createdBy: 'author-id',
      priority: 'medium',
      tags: ['tag1', 'tag2'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { task } = response.value
      expect(task.title).toEqual('New Task')
      expect(inMemoryTasksRepository.items[0].id).toEqual(task.id)
    }
  })

  it('should be able to create a task with attachments', async () => {
    const response = await sut.execute({
      title: 'New Task',
      description: 'A task for tests',
      projectId: 'project-id',
      assignedTo: ['2', '3'],
      createdBy: 'author-id',
      priority: 'medium',
      tags: ['tag1', 'tag2'],
      attachmentsIds: ['1', '2'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { task } = response.value
      expect(inMemoryTasksRepository.items[0].id).toEqual(task.id)
      expect(inMemoryTasksRepository.items[0].attachments).toHaveLength(2)
      expect(inMemoryTasksRepository.items[0].attachments).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
      ])
    }
  })

  it('should be able to create the slug automatically', async () => {
    const response = await sut.execute({
      title: 'New Task',
      description: 'A task for tests',
      projectId: 'project-id',
      assignedTo: ['2', '3'],
      createdBy: 'author-id',
      priority: 'medium',
      tags: ['tag1', 'tag2'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { task } = response.value
      expect(task.slug.value).toEqual('new-task')
    }
  })

  it('should be able to create a task with a valid due date', async () => {
    const inAnHour = new Date(new Date().setHours(new Date().getHours() + 1))

    const response = await sut.execute({
      title: 'New Task',
      description: 'A task for tests',
      projectId: 'project-id',
      assignedTo: ['2', '3'],
      createdBy: 'author-id',
      priority: 'medium',
      dueDate: inAnHour,
      tags: ['tag1', 'tag2'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { task } = response.value
      expect(task.slug.value).toEqual('new-task')
      expect(inMemoryTasksRepository.items[0].id).toBe(task.id)
    }
  })

  it('should not be able to go past a due date', async () => {
    const anHourAgo = new Date(new Date().setHours(new Date().getHours() - 1))

    const response = await sut.execute({
      title: 'New Task',
      description: 'A task for tests',
      projectId: 'project-id',
      assignedTo: ['2', '3'],
      createdBy: 'author-id',
      priority: 'medium',
      dueDate: anHourAgo,
      tags: ['tag1', 'tag2'],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(Error)
    expect(response.value).toHaveProperty(
      'message',
      'Is not allowed past due date',
    )
  })

  it('should be able to remove duplicate tags automatically', async () => {
    const response = await sut.execute({
      title: 'New Task',
      description: 'A task for tests',
      projectId: 'project-id',
      assignedTo: ['2', '3'],
      createdBy: 'author-id',
      priority: 'medium',
      tags: ['tag1', 'tag2', 'tag1'],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      const { task } = response.value
      expect(task.tags).toEqual(['tag1', 'tag2'])
      expect(inMemoryTasksRepository.items[0].tags).toEqual(['tag1', 'tag2'])
    }
  })
})
