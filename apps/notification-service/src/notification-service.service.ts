import { Injectable } from '@nestjs/common';
import {
  OrderCancelledEvent,
  OrderCreateEvent,
  OrderStatusEvent,
} from '@app/shared';

@Injectable()
export class NotificationService {
  handleOrderCreated(data: OrderCreateEvent) {
    console.log('═══════════════════════════════════════');
    console.log('📧 SENDING EMAIL: Order Created');
    console.log(`   To: User ${data.userId}`);
    console.log(`   Order: ${data.orderId}`);
    console.log(`   Total: ${data.totalAmount.toLocaleString()}đ`);
    console.log(`   Items: ${data.items.length} sản phẩm`);
    data.items.forEach((item) => {
      console.log(
        `     - ${item.productName} x${item.quantity} = ${item.price.toLocaleString()}đ`,
      );
    });
    console.log('═══════════════════════════════════════');
  }

  handleOrderCancelled(data: OrderCancelledEvent) {
    console.log('═══════════════════════════════════════');
    console.log('📧 SENDING EMAIL: Order Cancelled');
    console.log(`   To: User ${data.userId}`);
    console.log(`   Order: ${data.orderId}`);
    console.log(`   Reason: ${data.reason || 'Không có lý do'}`);
    console.log('═══════════════════════════════════════');
  }

  handleOrderStatusChanged(event: string, data: OrderStatusEvent) {
    console.log('═══════════════════════════════════════');
    console.log(`📧 SENDING EMAIL: Order ${data.status}`);
    console.log(`   To: User ${data.userId}`);
    console.log(`   Order: ${data.orderId}`);
    console.log('═══════════════════════════════════════');
  }
}
