import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBaseModule } from '@app/shared';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DataBaseModule.forRoot('PRODUCT_DB_NAME'),
    TypeOrmModule.forFeature([Product, Category]),
  ],
  controllers: [ProductServiceController],
  providers: [ProductServiceService],
})
export class ProductServiceModule {}
