import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { PORTS } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@app/shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(PaymentServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORTS.PAYMENT);
  console.log(
    `💳 Payment Service running on http://localhost:${PORTS.PAYMENT}`,
  );
}
bootstrap();
