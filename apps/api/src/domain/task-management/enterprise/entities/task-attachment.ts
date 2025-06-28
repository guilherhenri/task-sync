import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface TaskAttachmentProps {
  taskId: UniqueEntityID
  attachmentId: UniqueEntityID
}

export class TaskAttachment extends Entity<TaskAttachmentProps> {
  get taskId() {
    return this.props.taskId
  }

  get attachmentId() {
    return this.props.attachmentId
  }

  static create(props: TaskAttachmentProps, id?: UniqueEntityID) {
    const attachment = new TaskAttachment(props, id)

    return attachment
  }
}
