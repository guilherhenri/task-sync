import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [EnvService],
      global: true,
      useFactory: (config: EnvService) => {
        const privateKey = config.get('JWT_PRIVATE_KEY')
        const publicKey = config.get('JWT_PUBLIC_KEY')

        return {
          signOptions: { algorithm: 'RS256', expiresIn: '10m' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
      imports: [EnvModule],
    }),
  ],
  providers: [
    EnvService,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
