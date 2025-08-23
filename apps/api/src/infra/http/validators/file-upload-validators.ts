import { FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common'

import { bytesToReadable } from '@/utils/bytes-to-readable'

/**
 * Validator that checks if a file's size does not exceed the specified maximum size,
 * providing a user-friendly error message with readable file size units.
 * Extends the base `MaxFileSizeValidator` to customize the error message.
 */
export class ReadableMaxFileSizeValidator extends MaxFileSizeValidator {
  isValid(file: Express.Multer.File): boolean {
    return super.isValid(file)
  }

  buildErrorMessage(): string {
    return `O arquivo excede o tamanho máximo permitido de ${bytesToReadable(this.validationOptions.maxSize)}.`
  }
}

/**
 * Validator that checks if a file's type matches the allowed types,
 * providing a formatted and user-friendly error message.
 * Extends the base `FileTypeValidator` to customize the error message formatting.
 */
export class FormattedFileTypeValidator extends FileTypeValidator {
  private formatFileTypes(fileType: string | RegExp) {
    const typeString = fileType instanceof RegExp ? fileType.source : fileType

    const types = typeString
      .replace(/^image\//, '')
      .replace(/[().]/g, '')
      .split('|')
      .map((type) => type.trim())
      .filter((type) => type.length > 0)

    if (types.length === 0) return ''
    if (types.length === 1) return types[0]
    if (types.length === 2) return `${types[0]} ou ${types[1]}`

    return `${types.slice(0, -1).join(', ')} ou ${types[types.length - 1]}`
  }

  isValid(file: Express.Multer.File): Promise<boolean> {
    return super.isValid(file)
  }

  buildErrorMessage(): string {
    return `O tipo de arquivo não é suportado. Use apenas arquivos ${this.formatFileTypes(this.validationOptions.fileType)}.`
  }
}
