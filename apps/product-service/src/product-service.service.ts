import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class ProductServiceService {
  getInfo() {
    return {
      service: 'product-service',
      port: PORTS.PRODUCT,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
