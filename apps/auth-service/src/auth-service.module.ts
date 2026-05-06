import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBaseModule } from '@app/shared';
import { User } from './domain/entities/user.entity';
import { AuthService } from './application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from './infrastructure/strategies/jwt.strategy';
import { RedisAuthModule } from './infrastructure/redis/redis.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DataBaseModule.forRoot('AUTH_DB_NAME'),
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    RedisAuthModule,
    Reflector,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get('THROTTLE_TTL') || 60) * 1000,
            limit: config.get('THROTTLE_LIMIT') || 100,
          },
        ],
      }),
    }),
  ],
  controllers: [AuthServiceController],
  providers: [
    AuthService,
    JWTStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthServiceModule {}
