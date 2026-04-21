import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class NotificationServiceService {
  getInfo() {
    return {
      service: 'notification-service',
      port: PORTS.NOTIFICATION,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
