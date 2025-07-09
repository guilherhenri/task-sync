import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { EmailRequest } from './email-request'

describe('Email Request Entity', () => {
  it('should be able to create an email request', async () => {
    const emailRequest = EmailRequest.create({
      eventType: 'email_verification',
      recipientId: new UniqueEntityID('recipient-id'),
      recipientEmail: 'example@email.com',
      subject: 'Email Test',
      templateName: 'email-verify',
      data: {
        name: 'User Test',
        verificationLink: 'https://tasksync.com?token=token',
      },
      priority: 'high',
    })

    expect(emailRequest.id).toBeInstanceOf(UniqueEntityID)
    expect(emailRequest.eventType).toEqual('email_verification')
    expect(emailRequest.recipientId.toString()).toEqual('recipient-id')
    expect(emailRequest.recipientEmail).toEqual('example@email.com')
    expect(emailRequest.subject).toEqual('Email Test')
    expect(emailRequest.templateName).toEqual('email-verify')
    expect(emailRequest.data).toEqual(
      expect.objectContaining({
        name: 'User Test',
        verificationLink: 'https://tasksync.com?token=token',
      }),
    )
    expect(emailRequest.status.value).toEqual('pending')
    expect(emailRequest.priority).toEqual('high')
    expect(emailRequest.createdAt.getTime()).toBeLessThan(Date.now())
    expect(emailRequest.updatedAt).toBeUndefined()
  })

  it('should be able to create an email request with default values', async () => {
    const emailRequest = EmailRequest.create({
      eventType: 'email_verification',
      recipientId: new UniqueEntityID('recipient-id'),
      recipientEmail: 'example@email.com',
      templateName: 'email-verify',
      data: {
        name: 'User Test',
        verificationLink: 'https://tasksync.com?token=token',
      },
    })

    expect(emailRequest.subject).toEqual('Verificar e-mail')
    expect(emailRequest.priority).toEqual('medium')
  })

  it('should be able to advance an email request status', async () => {
    const emailRequest = EmailRequest.create({
      eventType: 'email_verification',
      recipientId: new UniqueEntityID('recipient-id'),
      recipientEmail: 'example@email.com',
      templateName: 'email-verify',
      data: {
        name: 'User Test',
        verificationLink: 'https://tasksync.com?token=token',
      },
    })

    emailRequest.advanceStatus()

    expect(emailRequest.status.value).toEqual('processing')
    expect(emailRequest.updatedAt).toBeInstanceOf(Date)
  })

  it('should be able to mark an email request as failed', async () => {
    const emailRequest = EmailRequest.create({
      eventType: 'email_verification',
      recipientId: new UniqueEntityID('recipient-id'),
      recipientEmail: 'example@email.com',
      templateName: 'email-verify',
      data: {
        name: 'User Test',
        verificationLink: 'https://tasksync.com?token=token',
      },
    })

    emailRequest.markAsFailed()

    expect(emailRequest.status.value).toEqual('failed')
    expect(emailRequest.updatedAt).toBeInstanceOf(Date)
  })
})
