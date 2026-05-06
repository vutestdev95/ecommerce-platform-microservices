import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './application/dtos/register.dto';
import { AuthService } from './application/auth.service';
import { LoginDto } from './application/dtos/login.dto';
import { CurrentUser } from './infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { Roles } from './infrastructure/decorators/roles.decorator';
import { UserRole } from '@app/shared';
import { RoleGuard } from './infrastructure/guards/role.guard';
import { Throttle } from '@nestjs/throttler';
import * as express from 'express';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('/auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { refreshToken, ...result } = await this.authService.register(dto);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { refreshToken, ...result } = await this.authService.login(dto);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    return await this.authService.getProfile(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const oldToken = req.cookies?.['refreshToken'] as string | undefined;
    if (!oldToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { refreshToken, ...result } =
      await this.authService.refreshTokens(oldToken);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/auth',
    });
    return { message: 'Logged out successfully' };
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }
}
