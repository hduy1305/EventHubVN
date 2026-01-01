/* generated manually */
import type { TicketResponse } from './TicketResponse';

export type MarketplaceListing = {
  id?: string;
  ticket?: TicketResponse;
  sellerId?: string;
  price?: number;
  status?: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
};
