import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import { DataBaseModule } from '@app/shared';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/entities/order.entity';
import { OrderItem } from './domain/entities/order-item.entity';
import { OrderStatusLog } from './domain/entities/order-status-log.entity';
import { OrderService } from './application/services/order.service';

@Module({
  imports: [
    DataBaseModule.forRoot('ORDER_DB_NAME'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Order, OrderItem, OrderStatusLog]),
  ],
  controllers: [OrderServiceController],
  providers: [OrderService],
})
export class OrderServiceModule {}
