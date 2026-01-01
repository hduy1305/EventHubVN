/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentRequest } from '../models/PaymentRequest';
import type { PaymentTransaction } from '../models/PaymentTransaction';
import type { RefundRequest } from '../models/RefundRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentsService {
    /**
     * Process a payment directly
     * @param requestBody
     * @returns PaymentTransaction Payment transaction processed
     * @throws ApiError
     */
    public static postApiPayments(
        requestBody: PaymentRequest,
    ): CancelablePromise<PaymentTransaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/payments',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid payment request`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Handle VNPay return callback
     * @param params key/value params from VNPay return URL
     * @returns string Status message
     * @throws ApiError
     */
    public static getApiPaymentsVnpayReturn(
        params: Record<string, string>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/payments/vnpay_return',
            query: params,
        });
    }
    /**
     * Process a refund
     * @param requestBody
     * @returns PaymentTransaction Refund transaction processed
     * @throws ApiError
     */
    public static postApiPaymentsRefund(
        requestBody: RefundRequest,
    ): CancelablePromise<PaymentTransaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/payments/refund',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid refund request or transaction ID`,
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
}
