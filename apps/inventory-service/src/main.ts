import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule);
  await app.listen(PORTS.INVENTORY);
  console.log(
    `📊 Inventory Service running on http://localhost:${PORTS.INVENTORY}`,
  );
}
bootstrap();
