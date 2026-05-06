import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBaseModule } from '@app/shared';
import { User } from './domain/entities/user.entity';
import { AuthService } from './application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from './infrastructure/strategies/jwt.strategy';
import { RedisAuthModule } from './infrastructure/redis/redis.module';
import { Reflector } from '@nestjs/core';

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
  ],
  controllers: [AuthServiceController],
  providers: [AuthService, JWTStrategy],
})
export class AuthServiceModule {}
