import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { WinstonService } from './logging/winston.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const winston = app.get(WinstonService)

  app.setGlobalPrefix('/api/v1', {
    exclude: ['health', 'logging-health', 'metrics'],
  })

  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  const configSwagger = new DocumentBuilder()
    .setTitle('TaskSync API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, configSwagger)
  SwaggerModule.setup('api/docs', app, document)

  const configService = app.get(EnvService)
  const port = configService.get('PORT')
  const cookieSecret = configService.get('COOKIE_SECRET')

  app.use(cookieParser(cookieSecret))

  setInterval(() => {
    winston.logSystemMetrics()
  }, 30000)

  await app.listen(port, '0.0.0.0')
}

bootstrap()
