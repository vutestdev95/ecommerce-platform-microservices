import { Order } from './order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('order-status-logs')
export class OrderStatusLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  orderId: string;

  @Column({
    type: 'enum',
    nullable: true,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  fromStatus: OrderStatus;

  @Column({
    type: 'enum',
    nullable: true,
    enum: OrderStatus,
  })
  toStatus: OrderStatus;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  reason: string;

  @ManyToOne(() => Order, (order) => order.statusLogs)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  changedBy?: string;

  @CreateDateColumn()
  createdAt: Date;
}
