/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Reservation } from '../models/Reservation';
import type { ReservationRequest } from '../models/ReservationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReservationsService {
    /**
     * Create a reservation (Add to Cart)
     * @param requestBody
     * @returns Reservation Reservation created
     * @throws ApiError
     */
    public static postApiReservations(
        requestBody: ReservationRequest,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reservations',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input or purchase limit exceeded`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get reservation details by ID
     * @param id
     * @returns Reservation Reservation details
     * @throws ApiError
     */
    public static getApiReservations(
        id: number,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reservations/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the reservation user`,
                404: `Reservation not found`,
            },
        });
    }
    /**
     * Get reservations for a specific user
     * @param userId
     * @returns Reservation List of reservations for the user
     * @throws ApiError
     */
    public static getApiReservationsUser(
        userId: string,
    ): CancelablePromise<Array<Reservation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reservations/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the user themselves`,
            },
        });
    }
    /**
     * Confirm a pending reservation
     * @param id
     * @returns Reservation Reservation confirmed
     * @throws ApiError
     */
    public static postApiReservationsConfirm(
        id: number,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reservations/{id}/confirm',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the reservation user`,
                404: `Reservation not found`,
            },
        });
    }
    /**
     * Cancel a pending reservation
     * @param id
     * @returns Reservation Reservation cancelled
     * @throws ApiError
     */
    public static postApiReservationsCancel(
        id: number,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reservations/{id}/cancel',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the reservation user`,
                404: `Reservation not found`,
            },
        });
    }
    /**
     * Trigger cleanup of expired reservations (Admin only)
     * @returns void
     * @throws ApiError
     */
    public static postApiReservationsCleanupExpired(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reservations/cleanup-expired',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs can trigger cleanup`,
            },
        });
    }
    /**
     * Check seat availability
     * @param seatId
     * @returns boolean Seat availability status
     * @throws ApiError
     */
    public static getApiReservationsSeatAvailability(
        seatId: number,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reservations/seat-availability/{seatId}',
            path: {
                'seatId': seatId,
            },
            errors: {
                404: `Seat not found`,
            },
        });
    }
    /**
     * Get active reservations for an event
     * @param eventId
     * @returns Reservation List of active reservations
     * @throws ApiError
     */
    public static getApiReservationsEventActive(
        eventId: number,
    ): CancelablePromise<Array<Reservation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reservations/event/{eventId}/active',
            path: {
                'eventId': eventId,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
    /**
     * Add or update item in user's cart
     * @param requestBody
     * @returns Reservation Cart item added/updated
     * @throws ApiError
     */
    public static postApiReservationsCart(
        requestBody: ReservationRequest,
    ): CancelablePromise<Reservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/reservations/cart',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input or purchase limit exceeded`,
                401: `Unauthorized`,
                403: `Forbidden - User ID mismatch`,
            },
        });
    }
    /**
     * Remove item from user's cart
     * @param reservationId
     * @returns void
     * @throws ApiError
     */
    public static deleteApiReservationsCart(
        reservationId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/reservations/cart/{reservationId}',
            path: {
                'reservationId': reservationId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the reservation user`,
                404: `Reservation not found`,
            },
        });
    }
    /**
     * Get cart items for a specific user
     * @param userId
     * @returns Reservation List of cart items
     * @throws ApiError
     */
    public static getApiReservationsCartUser(
        userId: string,
    ): CancelablePromise<Array<Reservation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reservations/cart/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not the user themselves`,
            },
        });
    }
}
