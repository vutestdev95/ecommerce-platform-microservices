import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '../../domain/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const existingSku = await this.productRepo.findOne({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }

    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(isActive?: boolean): Promise<Product[]> {
    return this.productRepo.find({
      ...(isActive
        ? {
            where: { isActive },
          }
        : {}),
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await this.productRepo.findOne({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
      }
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async softDelete(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = false;
    return this.productRepo.save(product);
  }

  async restore(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    product.isActive = true;
    return this.productRepo.save(product);
  }
}
