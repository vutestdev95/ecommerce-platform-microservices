import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { PORTS } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@app/shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORTS.ORDER);
  console.log(`🛒 Order Service running on http://localhost:${PORTS.ORDER}`);
}
bootstrap();
