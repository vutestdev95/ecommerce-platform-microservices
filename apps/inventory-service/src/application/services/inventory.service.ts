import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../../domain/entities/inventory.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateInventoryDto } from '../dtos/create-inventory.dto';
import { UpdateStockDto } from '../dtos/update-stock.dto';
import { ReserveStockDto } from '../dtos/reserve-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    const { productId } = dto;
    const existingInventory = await this.findExistingInventory(productId);

    if (existingInventory) {
      throw new ConflictException('Product already exists');
    }

    const newInventory = this.inventoryRepository.create(dto);
    return this.inventoryRepository.save(newInventory);
  }

  async findByProductId(productId: string): Promise<Inventory> {
    const existingInventory = await this.findExistingInventory(productId);

    if (!existingInventory) {
      throw new NotFoundException(
        `Inventory for product "${productId}" not found`,
      );
    }
    return existingInventory;
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find();
  }

  async updateStock(dto: UpdateStockDto): Promise<Inventory> {
    const { productId, quantity } = dto;

    const existingInventory = await this.findExistingInventory(productId);

    if (!existingInventory) {
      throw new NotFoundException(
        `Inventory for product "${productId}" not found`,
      );
    }

    if (quantity < existingInventory.reservedQuantity) {
      throw new BadRequestException(
        `Cannot set quantity to ${dto.quantity}. Currently ${existingInventory.reservedQuantity} items are reserved.`,
      );
    }

    existingInventory.quantity = dto.quantity;
    return this.inventoryRepository.save(existingInventory);
  }

  async findExistingInventory(productId: string): Promise<Inventory | null> {
    return await this.inventoryRepository.findOne({
      where: {
        productId: productId,
      },
    });
  }

  async findLowStock(threshold: number = 10): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.quantity - inventory.reservedQuantity <= :threshold', {
        threshold,
      })
      .orderBy('inventory.quantity - inventory.reservedQuantity', 'ASC')
      .getMany();
  }

  async reserve(dto: ReserveStockDto): Promise<Inventory> {
    const { productId, quantity } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: {
          productId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });
      if (!inventory) {
        throw new NotFoundException(
          `Inventory for product "${productId}" not found`,
        );
      }

      const available = inventory.availableQuantity;

      if (available < quantity) {
        throw new BadRequestException(
          `Not enough stock. Available: ${available}, Requested: ${dto.quantity}`,
        );
      }

      inventory.reservedQuantity += quantity;
      const saved = await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async release(dto: ReserveStockDto): Promise<Inventory> {
    const { productId, quantity } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: {
          productId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });
      if (!inventory) {
        throw new NotFoundException(
          `Inventory for product "${productId}" not found`,
        );
      }

      if (inventory.reservedQuantity < dto.quantity) {
        throw new BadRequestException(
          `Cannot release ${dto.quantity}. Only ${inventory.reservedQuantity} reserved.`,
        );
      }

      inventory.reservedQuantity -= quantity;

      const saved = await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirm(dto: ReserveStockDto): Promise<Inventory> {
    const { productId, quantity } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: {
          productId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });
      if (!inventory) {
        throw new NotFoundException(
          `Inventory for product "${productId}" not found`,
        );
      }

      if (inventory.reservedQuantity < dto.quantity) {
        throw new BadRequestException(
          `Cannot confirm ${dto.quantity}. Only ${inventory.reservedQuantity} reserved.`,
        );
      }

      inventory.quantity -= dto.quantity;
      inventory.reservedQuantity -= dto.quantity;
      const saved = await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
