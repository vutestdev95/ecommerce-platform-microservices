import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'uuid', nullable: false })
  productId: string;

  @Column({ default: 0, type: 'int' })
  quantity: number;

  @Column({ default: 0, type: 'int' })
  reservedQuantity: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
