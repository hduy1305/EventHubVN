/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItemRequest } from './OrderItemRequest';
export type OrderRequest = {
    userId: string;
    eventId: number;
    /**
     * List of reservation IDs to convert into an order
     */
    reservationIds?: Array<number>;
    discountCode?: string;
    paymentMethod: string;
    currency?: string;
    items?: Array<OrderItemRequest>;
};

