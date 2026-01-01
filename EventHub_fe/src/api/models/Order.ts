/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from './OrderItem';
import type { OrderStatus } from './OrderStatus';
import type { PaymentInfo } from './PaymentInfo';
export type Order = {
    id?: number;
    userId?: string;
    eventId?: number;
    totalAmount?: number;
    currency?: string;
    discountCode?: string;
    paymentMethod?: string;
    status?: OrderStatus;
    createdAt?: string;
    updatedAt?: string;
    items?: Array<OrderItem>;
    paymentInfo?: PaymentInfo;
};

