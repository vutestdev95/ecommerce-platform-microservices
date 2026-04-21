import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class AuthServiceService {
  getInfo() {
    return {
      service: 'auth-service',
      port: PORTS.AUTH,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
