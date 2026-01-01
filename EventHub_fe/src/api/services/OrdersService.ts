/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from '../models/Order';
import type { OrderRequest } from '../models/OrderRequest';
import type { OrderResponse } from '../models/OrderResponse';
import type { OrderStatus } from '../models/OrderStatus';
import type { PaymentInfo } from '../models/PaymentInfo';
import type { PaymentInfoStatus } from '../models/PaymentInfoStatus';
import type { PaymentTransaction } from '../models/PaymentTransaction';
import type { TicketResponse } from '../models/TicketResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * Create a new order
     * @param requestBody
     * @returns OrderResponse Order created
     * @throws ApiError
     */
    public static postApiOrders(
        requestBody: OrderRequest,
    ): CancelablePromise<OrderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - User ID mismatch`,
            },
        });
    }
    /**
     * Get orders for a specific user
     * @param userId
     * @returns OrderResponse List of orders for the user
     * @throws ApiError
     */
    public static getApiOrdersUser(
        userId: string,
    ): CancelablePromise<Array<OrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/orders/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - User ID mismatch`,
            },
        });
    }
    /**
     * Get orders for a specific event (Organizer or Admin only)
     * @param eventId
     * @param status Filter orders by status
     * @returns OrderResponse List of orders for the event
     * @throws ApiError
     */
    public static getApiOrdersEvent(
        eventId: number,
        status?: OrderStatus,
    ): CancelablePromise<Array<OrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/orders/event/{eventId}',
            path: {
                'eventId': eventId,
            },
            query: {
                'status': status,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not an ORGANIZER or ADMIN`,
            },
        });
    }
    /**
     * Get order details by ID
     * @param id
     * @returns OrderResponse Order details
     * @throws ApiError
     */
    public static getApiOrders(
        id: number,
    ): CancelablePromise<OrderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/orders/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not ADMIN, order user, or event organizer`,
                404: `Order not found`,
            },
        });
    }
    /**
     * Update order status
     * @param id
     * @param status New status for the order
     * @returns Order Order status updated
     * @throws ApiError
     */
    public static putApiOrders(
        id: number,
        status: OrderStatus,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/orders/{id}',
            path: {
                'id': id,
            },
            query: {
                'status': status,
            },
            errors: {
                400: `Invalid status`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can update order status`,
                404: `Order not found`,
            },
        });
    }
    /**
     * Cancel an order
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static putApiOrdersCancel(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/orders/{id}/cancel',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not ADMIN, order user, or event organizer`,
                404: `Order not found`,
            },
        });
    }
    /**
     * Internal payment callback (webhook)
     * @param id
     * @param transactionId
     * @param paymentStatus
     * @returns PaymentInfo Payment info updated
     * @throws ApiError
     */
    public static postApiOrdersPaymentCallback(
        id: number,
        transactionId: string,
        paymentStatus: PaymentInfoStatus,
    ): CancelablePromise<PaymentInfo> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/orders/{id}/payment-callback',
            path: {
                'id': id,
            },
            query: {
                'transactionId': transactionId,
                'paymentStatus': paymentStatus,
            },
            errors: {
                404: `Order not found`,
            },
        });
    }
    /**
     * Get tickets for a specific order
     * @param id
     * @returns TicketResponse List of tickets for the order
     * @throws ApiError
     */
    public static getApiOrdersTickets(
        id: number,
    ): CancelablePromise<Array<TicketResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tickets/order/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the order user`,
            },
        });
    }
    /**
     * Initiate payment for an order
     * @param orderId
     * @param paymentMethod
     * @returns PaymentTransaction Payment initiated
     * @throws ApiError
     */
    public static postApiOrdersInitiatePayment(
        orderId: number,
        paymentMethod: string,
    ): CancelablePromise<PaymentTransaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/orders/{orderId}/initiate-payment',
            path: {
                'orderId': orderId,
            },
            query: {
                'paymentMethod': paymentMethod,
            },
            errors: {
                400: `Invalid payment method or order status`,
                401: `Unauthorized`,
                403: `Forbidden - Not the order user`,
            },
        });
    }
    /**
     * Resend tickets for an order
     * @param orderId
     * @param recipientEmail
     * @returns void
     * @throws ApiError
     */
    public static postApiOrdersResendTickets(
        orderId: number,
        recipientEmail: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/orders/{orderId}/resend-tickets',
            path: {
                'orderId': orderId,
            },
            query: {
                'recipientEmail': recipientEmail,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the order user`,
                404: `Order not found`,
            },
        });
    }
}
