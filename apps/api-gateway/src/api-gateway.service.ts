import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly configService: ConfigService) {}

  getInfo() {
    return {
      service: 'api-gateway',
      port: this.configService.get<number>('API_GATEWAY_PORT', 3000),
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
