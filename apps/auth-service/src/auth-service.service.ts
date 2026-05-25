import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthServiceService {
  constructor(private readonly configService: ConfigService) {}

  getInfo() {
    return {
      service: 'auth-service',
      port: this.configService.get<number>('AUTH_HTTP_PORT', 3001),
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
