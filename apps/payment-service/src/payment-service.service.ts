import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentServiceService {
  constructor(private readonly configService: ConfigService) {}

  getInfo() {
    return {
      service: 'payment-service',
      port: this.configService.get<number>('PAYMENT_HTTP_PORT', 3004),
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
