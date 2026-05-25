import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationServiceService {
  constructor(private readonly configService: ConfigService) {}

  getInfo() {
    return {
      service: 'notification-service',
      port: this.configService.get<number>('NOTIFICATION_HTTP_PORT', 3006),
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
