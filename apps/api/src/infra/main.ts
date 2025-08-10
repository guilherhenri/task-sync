import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('/api/v1')

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

  await app.listen(port)
}
bootstrap()
