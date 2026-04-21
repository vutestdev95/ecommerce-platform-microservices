import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { PORTS } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  await app.listen(PORTS.API_GATEWAY);
  console.log(
    `🚀 API Gateway running on http://localhost:${PORTS.API_GATEWAY}`,
  );
}
bootstrap();
