import { Order } from './order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../types/order-status.enum';

@Entity('order-status-log')
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
    nullable: false,
    enum: OrderStatus,
  })
  fromStatus: OrderStatus;

  @Column({
    type: 'enum',
    nullable: false,
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

  @CreateDateColumn()
  createdAt: Date;
}
