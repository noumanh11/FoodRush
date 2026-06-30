import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../restaurants/menu-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column()
  menuItemName: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => MenuItem, (item) => item.orderItems, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem | null;

  @Column({ nullable: true })
  menuItemId: string | null;
}