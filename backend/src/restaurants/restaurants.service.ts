import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(dto: CreateRestaurantDto, owner: User): Promise<Restaurant> {
    const existing = await this.restaurantRepository.findOne({
      where: { ownerId: owner.id },
    });
    if (existing) {
      throw new ConflictException('You already have a restaurant registered');
    }

    const restaurant = this.restaurantRepository.create({
      ...dto,
      ownerId: owner.id,
    });
    return this.restaurantRepository.save(restaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      order: { isOpen: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['menuItems'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findByOwner(ownerId: string): Promise<Restaurant | null> {
    return this.restaurantRepository.findOne({
      where: { ownerId },
      relations: ['menuItems'],
    });
  }

  async update(id: string, dto: UpdateRestaurantDto, user: User): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && restaurant.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this restaurant');
    }
    Object.assign(restaurant, dto);
    return this.restaurantRepository.save(restaurant);
  }

  async getAllForAdmin(): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }
}