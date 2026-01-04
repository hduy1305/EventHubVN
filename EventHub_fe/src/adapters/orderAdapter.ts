import type { Order } from '../api/models/Order';
import type { OrderResponse } from '../api/models/OrderResponse';
import { OrderStatus } from '../api/models/OrderStatus';

export function mapOrderResponseToOrder(
  raw: OrderResponse
): Order {
  return {
    id: raw.id,
    userId: raw.userId,
    eventId: raw.eventId,
    totalAmount: raw.totalAmount,
    currency: raw.currency,
    discountCode: raw.discountCode,
    paymentMethod: raw.paymentMethod,
    status: raw.status as OrderStatus,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
    items: raw.items,
    paymentInfo: raw.paymentInfo,
  };
}
