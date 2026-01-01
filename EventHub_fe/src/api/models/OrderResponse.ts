/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItemResponse } from './OrderItemResponse';
export type OrderResponse = {
    id?: number;
    userId?: string;
    eventId?: number;
    totalAmount?: number;
    currency?: string;
    discountCode?: string;
    paymentMethod?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    items?: Array<OrderItemResponse>;
};

