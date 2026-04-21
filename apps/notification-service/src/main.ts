import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  await app.listen(PORTS.NOTIFICATION);
  console.log(
    `🔔 Notification Service running on http://localhost:${PORTS.NOTIFICATION}`,
  );
}
bootstrap();
