import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    let role = UserRole.USER;
    if (createUserDto.role === UserRole.RESTAURANT) {
      role = UserRole.RESTAURANT;
    }
    // Admin accounts cannot be created via public registration

    const user = this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  /** Used by seed script only — bypasses public registration role restrictions */
  async createWithRole(createUserDto: CreateUserDto, role: UserRole): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  async ensureRole(email: string, role: UserRole): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;
    if (user.role !== role) {
      user.role = role;
      return this.userRepository.save(user);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}