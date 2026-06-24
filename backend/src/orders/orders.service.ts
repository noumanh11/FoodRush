import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './create-order.dto';
import { UpdateOrderStatusDto } from './update-order-status.dto';
import { MenusService } from '../menus/menus.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly menusService: MenusService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(dto: CreateOrderDto, user: User): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let totalAmount = 0;
    const orderItems: Partial<OrderItem>[] = [];
    let restaurantId: string;

    for (const item of dto.items) {
      const menuItem = await this.menusService.findOne(item.menuItemId);
      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is currently unavailable`);
      }
      if (!restaurantId) {
        restaurantId = menuItem.restaurantId;
        const restaurant = await this.restaurantsService.findOne(restaurantId);
        if (!restaurant.isOpen) {
          throw new BadRequestException('This restaurant is currently closed');
        }
      } else if (restaurantId !== menuItem.restaurantId) {
        throw new BadRequestException('All items must be from the same restaurant');
      }
      const subtotal = Number(menuItem.price) * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        menuItemId: item.menuItemId,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal,
      });
    }

    const order = this.orderRepository.create({
      userId: user.id,
      restaurantId,
      totalAmount,
      deliveryAddress: dto.deliveryAddress,
      notes: dto.notes,
      status: OrderStatus.PENDING,
      items: orderItems as OrderItem[],
    });

    return this.orderRepository.save(order);
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['restaurant', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findRestaurantOrders(restaurantId: string, userId: string): Promise<Order[]> {
    const restaurant = await this.restaurantsService.findOne(restaurantId);
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }
    return this.orderRepository.find({
      where: { restaurantId },
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user?: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['restaurant', 'items', 'user'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (user) {
      this.assertCanViewOrder(order, user);
    }

    return order;
  }

  private assertCanViewOrder(order: Order, user: User): void {
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.USER && order.userId === user.id) return;
    if (
      user.role === UserRole.RESTAURANT &&
      order.restaurant?.ownerId === user.id
    ) {
      return;
    }
    throw new ForbiddenException('You do not have access to this order');
  }

  async cancelOrder(id: string, user: User): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.CANCELLED }, user);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: User): Promise<Order> {
    const order = await this.findOne(id, user);

    if (user.role === UserRole.RESTAURANT) {
      const restaurant = order.restaurant;
      if (restaurant.ownerId !== user.id) {
        throw new ForbiddenException('You do not manage this restaurant');
      }
      const allowedTransitions = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
        [OrderStatus.PREPARING]: [OrderStatus.READY],
        [OrderStatus.READY]: [OrderStatus.DELIVERED],
      };
      if (!allowedTransitions[order.status]?.includes(dto.status)) {
        throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
      }
    } else if (user.role === UserRole.ADMIN) {
      if (dto.status !== OrderStatus.CANCELLED) {
        throw new ForbiddenException('Admin can only cancel orders');
      }
      if (
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CANCELLED
      ) {
        throw new BadRequestException(`Cannot cancel an order that is already ${order.status}`);
      }
    } else {
      throw new ForbiddenException('Not authorized');
    }

    order.status = dto.status;
    return this.orderRepository.save(order);
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'restaurant', 'items'],
      order: { createdAt: 'DESC' },
    });
  }
}