import { Controller } from '@nestjs/common';
import { NotificationService } from './notification-service.service';
import type {
  OrderCancelledEvent,
  OrderCreateEvent,
  OrderStatusEvent,
} from '@app/shared';
import { OrderEvents } from '@app/shared';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationServiceService: NotificationService,
  ) {}

  @EventPattern(OrderEvents.Created)
  handleOrderCreated(@Payload() data: OrderCreateEvent) {
    this.notificationServiceService.handleOrderCreated(data);
  }

  @EventPattern(OrderEvents.Cancelled)
  handleOrderCancelled(@Payload() data: OrderCancelledEvent) {
    this.notificationServiceService.handleOrderCancelled(data);
  }

  @EventPattern(OrderEvents.Confirmed)
  handleOrderConfirmed(@Payload() data: OrderStatusEvent) {
    this.notificationServiceService.handleOrderStatusChanged('CONFIRMED', data);
  }

  @EventPattern(OrderEvents.Delivered)
  handleOrderDelivered(@Payload() data: OrderStatusEvent) {
    this.notificationServiceService.handleOrderStatusChanged('DELIVERED', data);
  }
}
