import * as winston from 'winston'

export const productionFormatter = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const {
      timestamp,
      level,
      message,
      service,
      version,
      environment,
      correlationId,
      type,
      stack,
      metadata,
      ...rest
    } = info

    const logObject = {
      '@timestamp': timestamp,
      level: level.toLowerCase(),
      message,
      service,
      version,
      environment,
      ...rest,
      ...(correlationId ? { correlationId } : {}),
      ...(type ? { type } : {}),
      ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
      ...(stack ? { stack } : {}),
    }

    Object.keys(logObject).forEach((key) => {
      if (logObject[key as keyof typeof logObject] === undefined) {
        delete logObject[key as keyof typeof logObject]
      }
    })

    return JSON.stringify(logObject)
  }),
)
