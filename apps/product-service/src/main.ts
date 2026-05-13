import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { PORTS } from '@app/shared';
import { ValidationPipe } from '@nestjs/common';
import { QueryProductDto } from './application/dtos/query-product.dto';

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const dto = new QueryProductDto();
  console.log(dto);
  await app.listen(PORTS.PRODUCT);
  console.log(
    `📦 Product Service running on http://localhost:${PORTS.PRODUCT}`,
  );
}
bootstrap();
