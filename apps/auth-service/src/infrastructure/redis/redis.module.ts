import { Module } from '@nestjs/common';
import { RedisModule as NestJSRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [
    NestJSRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'single' as const,
          url: `redis://:${config.get('REDIS_PASSWORD')}@${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
          onClientReady: (client: Redis) => {
            client.on('error', (err) => console.error('Redis error:', err));
            client.on('connect', () => console.log('Redis connected'));
          },
        };
      },
    }),
  ],
})
export class RedisAuthModule {}
