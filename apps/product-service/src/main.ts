import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { PORTS } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(PORTS.PRODUCT);
  console.log(
    `📦 Product Service running on http://localhost:${PORTS.PRODUCT}`,
  );
}
bootstrap();
