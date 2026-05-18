import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { PORTS } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(PORTS.ORDER);
  console.log(`🛒 Order Service running on http://localhost:${PORTS.ORDER}`);
}
bootstrap();
