import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../../domain/entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatusLog } from '../../domain/entities/order-status-log.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import {
  OrderStatus,
  VALID_TRANSITIONS,
} from '../../domain/enums/order-status.enum';
import { QueryOrderDto } from '../dtos/query-order.dto';
import { UpdateStatusDto } from '../dtos/update-status.dto';
import { SERVICES } from '@app/shared';
import type { ClientGrpc } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { InventoryGrpcService } from '@app/shared/interfaces/inventory-proto.interface';
import { firstValueFrom } from 'rxjs';
import { ProductResponse } from '@app/shared/interfaces/product-response.interface';

@Injectable()
export class OrderService implements OnModuleInit {
  private inventoryGrpc: InventoryGrpcService;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(OrderStatusLog)
    private readonly orderStatusLogRepo: Repository<OrderStatusLog>,

    @Inject(SERVICES.PRODUCT)
    private readonly productClient: ClientProxy,

    @Inject(SERVICES.INVENTORY)
    private readonly inventoryClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.inventoryGrpc =
      this.inventoryClient.getService<InventoryGrpcService>('InventoryService');
  }

  async findAllOrders(dto: QueryOrderDto) {
    const { userId, page = 1, status, limit = 20 } = dto;
    const queryOrderBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.statusLogs', 'statusLogs')
      .orderBy('order.createdAt', 'DESC');

    if (userId) {
      queryOrderBuilder.andWhere('userId = :userId', { userId });
    }

    if (status) {
      queryOrderBuilder.andWhere('status = :status', { status });
    }

    const total = await queryOrderBuilder.getCount();

    const skip = (page - 1) * limit;

    queryOrderBuilder.take(limit).skip(skip);
    const orders = await queryOrderBuilder.getMany();
    return {
      data: orders,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'statusLogs'],
      order: { statusLogs: { createdAt: 'ASC' } },
    });
    if (!order) {
      throw new NotFoundException(`Order "${id}" not found`);
    }
    return order;
  }

  async updateStatus(dto: UpdateStatusDto): Promise<Order> {
    const { id, status, reason, changedBy } = dto;
    const order = await this.orderRepo.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    const allowedStatuses = VALID_TRANSITIONS[order.status];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${status}. Allowed: [${allowedStatuses.join(', ')}]`,
      );
    }

    const log = this.orderStatusLogRepo.create({
      orderId: id,
      fromStatus: order.status,
      toStatus: status,
      changedBy: changedBy,
      reason: reason,
    });
    await this.orderStatusLogRepo.save(log);

    order.status = status;
    return await this.orderRepo.save(order);
  }

  async getStatusLogs(id: string): Promise<OrderStatusLog[]> {
    const order = await this.findOne(id);
    return this.orderStatusLogRepo.find({
      where: { orderId: order.id },
      order: { createdAt: 'ASC' },
    });
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const { shippingAddress, note, userId, items } = dto;

    const productIds = items.map((item) => item.productId);
    console.log('Fetching products for IDs:', productIds);
    const products = await this.getProductsByIds(productIds);
    const productMap = new Map(
      products.map((p: { id: string; name: string; price: number }) => [
        p.id,
        p,
      ]),
    );
    console.log(productMap);

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product "${item.productId}" not found`);
      }
      const orderItem = new OrderItem();
      orderItem.productId = item.productId;
      orderItem.productName = product.name;
      orderItem.price = Number(product.price);
      orderItem.quantity = item.quantity;
      orderItem.subtotal = Number(product.price) * item.quantity;
      return orderItem;
    });

    for (const item of orderItems) {
      await this.reserveInventory(item.productId, item.quantity);
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const initLog = new OrderStatusLog();
    initLog.fromStatus = null as unknown as OrderStatus;
    initLog.toStatus = OrderStatus.PENDING;
    initLog.reason = 'Order created';
    initLog.changedBy = userId;

    const order = this.orderRepo.create({
      userId,
      shippingAddress,
      note,
      totalAmount,
      items: orderItems,
      statusLogs: [initLog],
    });

    console.log(order);

    return this.orderRepo.save(order);
  }

  private async getProductsByIds(ids: string[]): Promise<ProductResponse[]> {
    return await firstValueFrom(
      this.productClient.send('product.findMany', { ids }),
    );
  }

  private async findOneProduct(ids: string): Promise<ProductResponse> {
    return await firstValueFrom(
      this.productClient.send('product.findOne', { ids }),
    );
  }

  private async reserveInventory(productId: string, quantity: number) {
    return firstValueFrom(this.inventoryGrpc.reserve({ productId, quantity }));
  }

  private async releaseInventory(productId: string, quantity: number) {
    return firstValueFrom(this.inventoryGrpc.release({ productId, quantity }));
  }
}
