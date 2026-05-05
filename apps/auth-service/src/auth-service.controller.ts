import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './application/dtos/register.dto';
import { AuthService } from './application/auth.service';
import { LoginDto } from './application/dtos/login.dto';
import { CurrentUser } from './infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Controller('/auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.authService.login(dto);
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
  async refresh(@Body('refreshToken') refreshToken: string): Promise<any> {
    return await this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: { id: string }) {
    await this.authService.logout(user.id);
    return { message: 'Logged out successfully' };
  }
}
