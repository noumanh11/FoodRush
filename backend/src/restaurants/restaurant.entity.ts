import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { MenuItem } from './menu-item.entity';
import { Order } from '../orders/order.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cuisine: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ nullable: true, type: 'decimal', precision: 3, scale: 1 })
  rating: number;

  @OneToOne(() => User, (user) => user.restaurant)
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => MenuItem, (item) => item.restaurant)
  menuItems: MenuItem[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}