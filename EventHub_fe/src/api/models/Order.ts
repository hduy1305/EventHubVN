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
    createdAt?: Date | null;
    updatedAt?: Date | null;
    items?: Array<OrderItem>;
    paymentInfo?: PaymentInfo;
};

