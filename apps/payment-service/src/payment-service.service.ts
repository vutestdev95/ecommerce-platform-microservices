import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class PaymentServiceService {
  getInfo() {
    return {
      service: 'payment-service',
      port: PORTS.PAYMENT,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
