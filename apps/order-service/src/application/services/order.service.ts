import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(OrderStatusLog)
    private readonly orderStatusLogRepo: Repository<OrderStatusLog>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const { shippingAddress, note, userId, items } = dto;
    const orderItems = items.map<OrderItem>((item) => {
      const { productName, productId, quantity, price } = item;
      const rawOrderItem = new OrderItem();
      rawOrderItem.productId = productId;
      rawOrderItem.productName = productName;
      rawOrderItem.price = price;
      rawOrderItem.quantity = quantity;
      rawOrderItem.subtotal = price * quantity;
      return rawOrderItem;
    });

    const initStatusLog = new OrderStatusLog();
    initStatusLog.fromStatus = null as unknown as OrderStatus;
    initStatusLog.toStatus = OrderStatus.PENDING;
    initStatusLog.reason = 'Init Order';
    initStatusLog.changedBy = userId;

    const totalAmount = orderItems.reduce<number>((acr, curr) => {
      return acr + curr.subtotal;
    }, 0);

    const order = this.orderRepo.create({
      shippingAddress,
      note,
      userId,
      items: orderItems,
      statusLogs: [initStatusLog],
      totalAmount,
    });

    return this.orderRepo.save(order);
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
}
