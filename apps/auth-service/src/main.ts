import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  await app.listen(PORTS.AUTH);
  console.log(`🔐 Auth Service running on http://localhost:${PORTS.AUTH}`);
}
bootstrap();
