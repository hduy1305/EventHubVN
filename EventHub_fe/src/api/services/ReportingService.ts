/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportingService {
    /**
     * Get total revenue across all events
     * @returns number Total revenue
     * @throws ApiError
     */
    public static getApiReportsRevenueTotal(): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reports/revenue/total',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs or ORGANIZERs can access reports`,
            },
        });
    }
    /**
     * Get revenue for a specific event
     * @param eventId
     * @returns number Revenue for the event
     * @throws ApiError
     */
    public static getApiReportsRevenueEvent(
        eventId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reports/revenue/event/{eventId}',
            path: {
                'eventId': eventId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs or ORGANIZERs can access reports`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Get total number of tickets sold across all events
     * @returns number Total tickets sold
     * @throws ApiError
     */
    public static getApiReportsTicketsTotalSold(): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reports/tickets/total-sold',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs or ORGANIZERs can access reports`,
            },
        });
    }
    /**
     * Get total number of tickets sold for a specific event
     * @param eventId
     * @returns number Total tickets sold for the event
     * @throws ApiError
     */
    public static getApiReportsTicketsEventSold(
        eventId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/reports/tickets/event/{eventId}/sold',
            path: {
                'eventId': eventId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs or ORGANIZERs can access reports`,
                404: `Event not found`,
            },
        });
    }

    /**
     * Get daily ticket sales for an event
     * @param eventId
     * @param startDate
     * @param endDate
     * @returns DailySalesDto
     * @throws ApiError
     */
    public static getApiStatsEventsDailySales(
        eventId: number,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<{ date: string; count: number }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stats/events/{eventId}/daily-sales',
            path: {
                'eventId': eventId,
            },
            query: {
                'startDate': startDate,
                'endDate': endDate,
            },
            errors: {
                403: `Forbidden - Only ADMINs or ORGANIZERs can access reports`,
                404: `Event not found`,
            },
        });
    }
}
