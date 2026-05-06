import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { JwtPayload } from '@app/shared';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existingUser = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt: string = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: passwordHash,
      fullName: dto.fullName,
    });

    const savedUser = await this.userRepo.save(user);

    return this.generateTokens(savedUser);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  async getAllUsers() {
    const users = await this.userRepo.find({
      select: ['id', 'email', 'fullName', 'role', 'status', 'createdAt'],
    });

    return {
      total: users.length,
      users,
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    //AccessToken
    const accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'fallback';
    const accessTokenExpiresIn = Number.parseInt(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') ?? '2400',
    );
    const accessToken = this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpiresIn,
    });

    //RefreshToken
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'fallback';
    const refreshTokenExpiresIn = Number.parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '604800',
    );

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiresIn,
    });

    await this.redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
