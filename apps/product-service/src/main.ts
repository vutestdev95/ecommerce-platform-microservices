import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  await app.listen(PORTS.PRODUCT);
  console.log(
    `📦 Product Service running on http://localhost:${PORTS.PRODUCT}`,
  );
}
bootstrap();
