/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from './Order';
import type { PaymentInfoStatus } from './PaymentInfoStatus';
export type PaymentInfo = {
    id?: number;
    order?: Order;
    method?: string;
    transactionId?: string;
    amount?: number;
    status?: PaymentInfoStatus;
    paidAt?: string;
};

