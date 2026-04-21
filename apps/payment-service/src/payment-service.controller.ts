import { Controller, Get } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @Get()
  getInfo() {
    return this.paymentServiceService.getInfo();
  }
}
