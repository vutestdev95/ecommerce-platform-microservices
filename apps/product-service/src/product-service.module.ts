import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './domain/entities/product.entity';
import { Category } from './domain/entities/category.entity';
import { ProductServiceController } from './product-service.controller';
import { ProductService } from './application/services/product.service';
import { CategoryService } from './application/services/category.service';
import { DataBaseModule } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataBaseModule.forRoot('PRODUCT_DB_NAME'),
    TypeOrmModule.forFeature([Product, Category]),
  ],
  controllers: [ProductServiceController],
  providers: [ProductService, CategoryService],
})
export class ProductServiceModule {}
