import { Injectable } from '@nestjs/common';
import { PORTS } from '@app/shared';

@Injectable()
export class ApiGatewayService {
  getInfo() {
    return {
      service: 'api-gateway',
      port: PORTS.API_GATEWAY,
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
