import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(PaymentServiceModule);
  await app.listen(PORTS.PAYMENT);
  console.log(
    `💳 Payment Service running on http://localhost:${PORTS.PAYMENT}`,
  );
}
bootstrap();
