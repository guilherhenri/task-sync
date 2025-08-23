import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodObject } from 'zod/v4'
import { fromZodError } from 'zod-validation-error'

type ZodErrorDetails = Array<{ field: string; message: string }>

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject) {}

  private formatZodError(error: ZodError): ZodErrorDetails {
    const formattedError = fromZodError(error)

    return formattedError.details.reduce((acc, err) => {
      const field = err.path[0]?.toString() || 'unknown'

      acc.push({
        field,
        message: err.message,
      })

      return acc
    }, [] as ZodErrorDetails)
  }

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: {
            type: 'validation',
            details: this.formatZodError(error),
          },
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
