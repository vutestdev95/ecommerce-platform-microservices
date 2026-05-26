import { ConfigService } from '@nestjs/config';
import { ClientProvider, Transport } from '@nestjs/microservices';
import { join } from 'path';

export enum SERVICES {
  PRODUCT = 'PRODUCT_SERVICE',
  INVENTORY = 'INVENTORY_SERVICE',
  ORDER = 'ORDER_SERVICE',
  AUTH = 'AUTH_SERVICE',
  PAYMENT = 'PAYMENT_SERVICE',
  NOTIFICATION = 'NOTIFICATION_SERVICE',
}

export enum RABBITMQ_SERVICES {
  ORDER_SERVICE = 'RABBITMQ_ORDER_SERVICE',
  NOTIFICATION = 'RABBITMQ_NOTIFICATION',
  INVENTORY_QUEUE = 'RABBITMQ_INVENTORY_QUEUE',
}

export const createTcpClientOptions = (
  configService: ConfigService,
  hostKey: string,
  portKey: string,
): ClientProvider | Promise<ClientProvider> => {
  const host = configService.get<string>(hostKey) || 'localhost';
  const port = Number(configService.get<string>(portKey)) || 4000;
  return {
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  };
};

export function createGrpcClientOptions(
  config: ConfigService,
  hostKey: string,
  portKey: string,
  packageName: string,
  protoFile: string,
) {
  return {
    transport: Transport.GRPC as const,
    options: {
      package: packageName,
      protoPath: join(process.cwd(), `libs/shared/src/proto/${protoFile}`),
      url: `${config.get<string>(hostKey) || 'localhost'}:${config.get<number>(portKey) || 5000}`,
    },
  };
}

export const createRmqClientOptions = (
  configService: ConfigService,
  urlKey: string,
  queueKey: string,
) => {
  const url = configService.get<string>(urlKey) || 'amqp://localhost:5672';
  const queue = configService.get<string>(queueKey) || 'default_queue';
  return {
    transport: Transport.RMQ as const,
    options: {
      urls: [url],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
};
