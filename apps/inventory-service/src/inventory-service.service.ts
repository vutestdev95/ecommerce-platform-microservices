import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class InventoryServiceService {
  getInfo() {
    return {
      service: 'inventory-service',
      port: PORTS.INVENTORY,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
