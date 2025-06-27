import { TaskStatus } from './task-status'

describe('Task Status', () => {
  describe('Should go to next status', () => {
    it('todo => in_progress', () => {
      const nextStatus = TaskStatus.getNextStatus('todo')

      expect(nextStatus.value).toEqual('in_progress')
    })

    it('in_progress => review', () => {
      const nextStatus = TaskStatus.getNextStatus('in_progress')

      expect(nextStatus.value).toEqual('review')
    })

    it('review => done', () => {
      const nextStatus = TaskStatus.getNextStatus('review')

      expect(nextStatus.value).toEqual('done')
    })
  })

  it('should throw error if the actual status is done', () => {
    expect(() => {
      TaskStatus.getNextStatus('done')
    }).toThrow('Cannot get next status for a completed task')
  })
})
