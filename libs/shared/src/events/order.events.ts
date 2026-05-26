export enum OrderEvents {
  Created = 'order.created',
  Confirmed = 'order.confirmed',
  Cancelled = 'order.cancelled',
  Delivered = 'order.delivered',
}

export interface OrderCreateEvent {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderCancelledEvent {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  reason?: string;
}

export interface OrderStatusEvent {
  orderId: string;
  userId: string;
  status: string;
}
