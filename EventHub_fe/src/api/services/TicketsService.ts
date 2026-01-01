/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckInLogDto } from '../models/CheckInLogDto';
import type { TicketResponse } from '../models/TicketResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TicketsService {
    /**
     * Get ticket details by ticket code
     * @returns TicketResponse Ticket details
     * @throws ApiError
     */
    public static getApiTickets(): CancelablePromise<TicketResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tickets/{ticketCode}',
            errors: {
                404: `Ticket not found`,
            },
        });
    }
    /**
     * Get all tickets for a specific user
     * @param userId
     * @returns TicketResponse List of tickets for the user
     * @throws ApiError
     */
    public static getApiTicketsUser(
        userId: string,
    ): CancelablePromise<Array<TicketResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tickets/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Get all tickets for a specific event
     * @param eventId
     * @returns TicketResponse List of tickets for the event
     * @throws ApiError
     */
    public static getApiTicketsEvent(
        eventId: number,
    ): CancelablePromise<Array<TicketResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tickets/event/{eventId}',
            path: {
                'eventId': eventId,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
    /**
     * Scan a ticket for check-in
     * @param ticketCode
     * @param gate The gate at which the ticket is scanned (optional)
     * @param deviceId The ID of the scanning device (optional)
     * @returns TicketResponse Ticket scanned successfully
     * @throws ApiError
     */
    public static postApiTicketsScan(
        ticketCode: string,
        gate?: string,
        deviceId?: string,
        staffId?: string,
    ): CancelablePromise<TicketResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tickets/{ticketCode}/scan',
            path: {
                'ticketCode': ticketCode,
            },
            query: {
                'gate': gate,
                'deviceId': deviceId,
                'staffId': staffId,
            },
            errors: {
                400: `Ticket already scanned or invalid`,
                404: `Ticket not found`,
                500: `Internal server error (e.g., duplicate scan, event not active)`,
            },
        });
    }
    /**
     * Transfer a ticket to a new attendee
     * @param ticketCode
     * @param newAttendeeName
     * @param newAttendeeEmail
     * @returns TicketResponse Ticket transferred successfully
     * @throws ApiError
     */
    public static postApiTicketsTransfer(
        ticketCode: string,
        newAttendeeName: string,
        newAttendeeEmail: string,
    ): CancelablePromise<TicketResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tickets/{ticketCode}/transfer',
            path: {
                'ticketCode': ticketCode,
            },
            query: {
                'newAttendeeName': newAttendeeName,
                'newAttendeeEmail': newAttendeeEmail,
            },
            errors: {
                400: `Invalid attendee information or transfer not allowed`,
                404: `Ticket not found`,
                500: `Internal server error (e.g., transfer not enabled for event)`,
            },
        });
    }
    /**
     * Get check-in logs for an event
     * @param eventId
     * @returns CheckInLogDto List of check-in logs
     * @throws ApiError
     */
    public static getApiTicketsEventCheckInLogs(
        eventId: number,
    ): CancelablePromise<Array<CheckInLogDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tickets/event/{eventId}/check-in-logs',
            path: {
                'eventId': eventId,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
}
