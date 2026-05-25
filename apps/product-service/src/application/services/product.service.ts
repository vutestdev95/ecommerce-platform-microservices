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
import {
  QueryProductDto,
  SortField,
  SortOrder,
} from '../dtos/query-product.dto';

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

  async findAll(queryDto: QueryProductDto): Promise<any> {
    const {
      sort = SortField.CREATED_AT,
      maxPrice,
      minPrice,
      order = SortOrder.DESC,
      page = 1,
      search,
      limit = 20,
      categoryId,
    } = queryDto;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });
    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (minPrice) {
      qb.andWhere('product.minPrice = :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('product.maxPrice = :maxPrice', { maxPrice });
    }

    qb.orderBy(`product.${sort}`, order);

    const total = await qb.getCount();

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const products = await qb.getMany();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async findMany(ids: string[]): Promise<Product[]> {
    return this.productRepo.find({
      where: ids.map((id) => ({
        id,
      })),
      relations: ['category'],
    });
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
