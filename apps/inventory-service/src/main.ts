import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@app/shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('INVENTORY_HTTP_PORT', 3005);
  const grpcPort = configService.get<number>('INVENTORY_GRPC_PORT', 5005);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'inventory',
      protoPath: join(process.cwd(), 'libs/shared/src/proto/inventory.proto'),
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`📊 Inventory Service running on http://localhost:${port}`);
}
bootstrap();
