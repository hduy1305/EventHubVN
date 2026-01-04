import type { Order } from '../api/models/Order';
import { OrderStatus } from '../api/models/OrderStatus';

export function normalizeOrder(order: Order): Order {
  return {
    id: order.id!,
    userId: order.userId,
    eventId: order.eventId,
    totalAmount: order.totalAmount,
    currency: order.currency,
    status: order.status as OrderStatus,
    createdAt: order.createdAt ? new Date(order.createdAt) : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : null,
    items: order.items,
  };
}
