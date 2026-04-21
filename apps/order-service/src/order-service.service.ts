import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class OrderServiceService {
  getInfo() {
    return {
      service: 'order-service',
      port: PORTS.ORDER,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
