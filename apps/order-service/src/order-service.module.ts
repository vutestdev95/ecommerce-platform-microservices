import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import {
  createGrpcClientOptions,
  createTcpClientOptions,
  DataBaseModule,
  SERVICES,
} from '@app/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/entities/order.entity';
import { OrderItem } from './domain/entities/order-item.entity';
import { OrderStatusLog } from './domain/entities/order-status-log.entity';
import { OrderService } from './application/services/order.service';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    DataBaseModule.forRoot('ORDER_DB_NAME'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Order, OrderItem, OrderStatusLog]),
    ClientsModule.registerAsync([
      {
        name: SERVICES.PRODUCT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) =>
          createTcpClientOptions(
            config,
            'PRODUCT_TCP_HOST',
            'PRODUCT_TCP_PORT',
          ),
      },
      {
        name: SERVICES.INVENTORY,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) =>
          createGrpcClientOptions(
            config,
            'INVENTORY_GRPC_HOST',
            'INVENTORY_GRPC_PORT',
            'inventory',
            'inventory.proto',
          ),
      },
    ]),
  ],
  controllers: [OrderServiceController],
  providers: [OrderService],
})
export class OrderServiceModule {}
