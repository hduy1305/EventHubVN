/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentTransaction = {
    id?: number;
    orderId?: number;
    paymentMethod?: string;
    transactionId?: string;
    amount?: number;
    status?: PaymentTransaction.status;
    createdAt?: string;
    updatedAt?: string;
};
export namespace PaymentTransaction {
    export const status = {
        PENDING: 'PENDING',
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED',
        REFUNDED: 'REFUNDED',
    } as const;
    export type status = typeof status[keyof typeof status];
}

