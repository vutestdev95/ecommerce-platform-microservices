import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  await app.listen(PORTS.ORDER);
  console.log(`🛒 Order Service running on http://localhost:${PORTS.ORDER}`);
}
bootstrap();
