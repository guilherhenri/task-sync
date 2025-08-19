import { EmailStatus, type Status } from './email-status'

describe('constructor', () => {
  it('should initialize with "pending" status when no value is provided', () => {
    const emailStatus = new EmailStatus()
    expect(emailStatus.value).toBe('pending')
  })

  it('should initialize with provided status', () => {
    const emailStatus = new EmailStatus('processing')
    expect(emailStatus.value).toBe('processing')
  })

  it.each(['pending', 'processing', 'sent', 'failed'])(
    'should accept valid status: %s',
    (status) => {
      const emailStatus = new EmailStatus(status as Status)
      expect(emailStatus.value).toBe(status)
    },
  )
})

describe('getNextStatus', () => {
  it('should transition from pending to processing', () => {
    const nextStatus = EmailStatus.getNextStatus('pending')
    expect(nextStatus.value).toBe('processing')
  })

  it('should transition from processing to sent', () => {
    const nextStatus = EmailStatus.getNextStatus('processing')
    expect(nextStatus.value).toBe('sent')
  })

  it('should throw error when trying to get next status from sent', () => {
    expect(() => EmailStatus.getNextStatus('sent')).toThrow(
      'Cannot get next status for a sent email',
    )
  })

  it('should throw error when trying to get next status from failed', () => {
    expect(() => EmailStatus.getNextStatus('failed')).toThrow(
      'Cannot get next status for a failed email',
    )
  })
})
