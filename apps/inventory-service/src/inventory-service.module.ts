import { Module } from '@nestjs/common';
import { InventoryServiceController } from './inventory-service.controller';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './domain/entities/inventory.entity';
import { InventoryService } from './application/services/inventory.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DataBaseModule.forRoot('INVENTORY_DB_NAME'),
    TypeOrmModule.forFeature([Inventory]),
  ],
  controllers: [InventoryServiceController],
  providers: [InventoryService],
})
export class InventoryServiceModule {}
