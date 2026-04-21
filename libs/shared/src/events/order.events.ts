export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  createdAt: Date;
}
export interface OrderConfirmedEvent {
  orderId: string;
  transactionId: string;
}
export interface OrderCancelledEvent {
  orderId: string;
  reason: string;
}
