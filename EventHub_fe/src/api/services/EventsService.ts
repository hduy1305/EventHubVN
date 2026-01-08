/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Discount } from '../models/Discount';
import type { Event } from '../models/Event';
import type { EventStatus } from '../models/EventStatus';
import type { PageEvent } from '../models/PageEvent';
import type { Seat } from '../models/Seat';
import type { TicketType } from '../models/TicketType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EventsService {
    /**
     * Get all events
     * @returns Event List of events
     * @throws ApiError
     */
    public static getApiEvents(): CancelablePromise<Array<Event>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events',
        });
    }
    /**
     * Create a new event
     * @param requestBody
     * @returns Event Event created
     * @throws ApiError
     */
    public static postApiEvents(
        requestBody: Event,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can create events`,
            },
        });
    }

    /**
     * Save event draft from wizard
     * @param requestBody
     * @returns Event Event saved
     * @throws ApiError
     */
    public static postApiEventsDraft(
        requestBody: Record<string, any>,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/draft',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs can save drafts`,
            },
        });
    }

    /**
     * Submit event from wizard
     * @param requestBody
     * @returns Event Event submitted
     * @throws ApiError
     */
    public static postApiEventsSubmit(
        requestBody: Record<string, any>,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/submit',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs can submit`,
            },
        });
    }

    /**
     * Check if custom URL exists
     * @param customUrl
     * @param excludeEventId
     * @returns boolean
     * @throws ApiError
     */
    public static getApiEventsCustomUrlExists(
        customUrl: string,
        excludeEventId?: number,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/custom-url/exists',
            query: {
                'customUrl': customUrl,
                'excludeEventId': excludeEventId,
            },
        });
    }
    /**
     * Get event by ID
     * @param id
     * @returns Event Event details
     * @throws ApiError
     */
    public static getApiEvents1(
        id: number,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }

    /**
     * Get ticket types with showtimes and availability
     * @param id
     * @returns TicketTypeWithShowtimes[] List of ticket types with showtimes
     * @throws ApiError
     */
    public static getApiEventsTicketsWithShowtimes(
        id: number,
    ): CancelablePromise<any[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/{id}/tickets-with-showtimes',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update event
     * @param id
     * @param requestBody
     * @returns Event Event updated
     * @throws ApiError
     */
    public static putApiEvents(
        id: number,
        requestBody: Event,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/events/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can update events`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Delete event
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteApiEvents(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/events/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can delete events`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Search and filter events
     * @param keyword Keyword to search in event name or description
     * @param category Filter by event category
     * @param startTime Filter by events starting after this time
     * @param endTime Filter by events ending before this time
     * @param minPrice Filter by minimum ticket price
     * @param maxPrice Filter by maximum ticket price
     * @param status Filter by event status
     * @param location Filter by event location (city)
     * @param page Page number (0-indexed)
     * @param size Number of items per page
     * @returns PageEvent Filtered list of events with pagination info
     * @throws ApiError
     */
    public static getApiEventsSearch(
        keyword?: string,
        category?: string,
        startTime?: string,
        endTime?: string,
        minPrice?: number,
        maxPrice?: number,
        status?: EventStatus,
        location?: string,
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageEvent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/search',
            query: {
                'keyword': keyword,
                'category': category,
                'startTime': startTime,
                'endTime': endTime,
                'minPrice': minPrice,
                'maxPrice': maxPrice,
                'status': status,
                'location': location,
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * Get ticket types for an event
     * @param eventId
     * @returns TicketType List of ticket types
     * @throws ApiError
     */
    public static getApiEventsTicketTypes(
        eventId: number,
    ): CancelablePromise<Array<TicketType>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/{eventId}/ticket-types',
            path: {
                'eventId': eventId,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
    /**
     * Add ticket type to event
     * @param eventId
     * @param requestBody
     * @returns TicketType Ticket type added
     * @throws ApiError
     */
    public static postApiEventsTicketTypes(
        eventId: number,
        requestBody: TicketType,
    ): CancelablePromise<TicketType> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/{eventId}/ticket-types',
            path: {
                'eventId': eventId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can add ticket types`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Get ticket type by ID
     * @param ticketTypeId
     * @returns TicketType Ticket type details
     * @throws ApiError
     */
    public static getApiEventsTicketTypes1(
        ticketTypeId: number,
    ): CancelablePromise<TicketType> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/ticket-types/{ticketTypeId}',
            path: {
                'ticketTypeId': ticketTypeId,
            },
            errors: {
                404: `Ticket type not found`,
            },
        });
    }
    /**
     * Delete ticket type
     * @param ticketTypeId
     * @throws ApiError
     */
    public static deleteApiEventsTicketTypes(
        ticketTypeId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/events/ticket-types/{ticketTypeId}',
            path: {
                'ticketTypeId': ticketTypeId,
            },
        });
    }
    /**
     * Add discount code to event
     * @param eventId
     * @param requestBody
     * @returns Discount Discount code added
     * @throws ApiError
     */
    public static postApiEventsDiscounts(
        eventId: number,
        requestBody: Discount,
    ): CancelablePromise<Discount> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/{eventId}/discounts',
            path: {
                'eventId': eventId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can add discounts`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Get all discount codes for an event
     * @param eventId
     * @returns Discount List of discount codes
     * @throws ApiError
     */
    public static getApiEventsDiscounts(
        eventId: number,
    ): CancelablePromise<Array<Discount>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/{eventId}/discounts',
            path: {
                'eventId': eventId,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
    /**
     * Delete discount code
     * @param discountId
     * @returns void
     * @throws ApiError
     */
    public static deleteApiEventsDiscounts(
        discountId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/events/discounts/{discountId}',
            path: {
                'discountId': discountId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can delete discounts`,
                404: `Discount not found`,
            },
        });
    }
    /**
     * Validate a discount code for an event
     * @param eventId
     * @param code
     * @returns Discount Discount code is valid
     * @throws ApiError
     */
    public static getApiEventsDiscountsValidate(
        eventId: number,
        code: string,
    ): CancelablePromise<Discount> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/{eventId}/discounts/validate',
            path: {
                'eventId': eventId,
            },
            query: {
                'code': code,
            },
            errors: {
                404: `Discount code not found or invalid`,
            },
        });
    }
    /**
     * Increment the usage count of a discount code
     * @param discountId
     * @returns void
     * @throws ApiError
     */
    public static postApiEventsDiscountsIncrementUsage(
        discountId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/discounts/{discountId}/increment-usage',
            path: {
                'discountId': discountId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can increment discount usage`,
                404: `Discount not found`,
            },
        });
    }
    /**
     * Add seats to an event
     * @param eventId
     * @param requestBody
     * @returns Seat Seats added
     * @throws ApiError
     */
    public static postApiEventsSeats(
        eventId: number,
        requestBody: Array<Seat>,
    ): CancelablePromise<Array<Seat>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/{eventId}/seats',
            path: {
                'eventId': eventId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can add seats`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Get all seats for an event
     * @param eventId
     * @returns Seat List of seats
     * @throws ApiError
     */
    public static getApiEventsSeats(
        eventId: number,
    ): CancelablePromise<Array<Seat>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/{eventId}/seats',
            path: {
                'eventId': eventId,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
    /**
     * Update seat availability
     * @param seatId
     * @param isAvailable
     * @returns void
     * @throws ApiError
     */
    public static putApiEventsSeatsAvailability(
        seatId: number,
        isAvailable: boolean,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/events/seats/{seatId}/availability',
            path: {
                'seatId': seatId,
            },
            query: {
                'isAvailable': isAvailable,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can update seat availability`,
                404: `Seat not found`,
            },
        });
    }
    /**
     * Update seat lock status
     * @param seatId
     * @param locked
     * @returns void
     * @throws ApiError
     */
    public static putApiEventsSeatsLock(
        seatId: number,
        locked: boolean,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/events/seats/{seatId}/lock',
            path: {
                'seatId': seatId,
            },
            query: {
                'locked': locked,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs or ADMINs can update seat lock status`,
                404: `Seat not found`,
            },
        });
    }
    
    /**
     * Update event status
     * @param eventId
     * @param status
     * @returns Event Event status updated
     * @throws ApiError
     */
    public static putApiEventsStatus(
        eventId: number,
        status: EventStatus,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/events/{eventId}/status',
            path: {
                'eventId': eventId,
            },
            query: {
                'status': status,
            },
            errors: {
                400: `Invalid status`,
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs can update event status`,
                404: `Event not found`,
            },
        });
    }

    /**
     * Submit an event for approval
     * @param eventId
     * @returns Event Event submitted
     * @throws ApiError
     */
    public static postApiEventsIdSubmit(
        eventId: number,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/{id}/submit',
            path: {
                'id': eventId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ORGANIZERs can submit events`,
                404: `Event not found`,
            },
        });
    }

    /**
     * Approve an event
     * @param eventId
     * @returns Event Event approved
     * @throws ApiError
     */
    public static postApiEventsIdApprove(
        eventId: number,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/{id}/approve',
            path: {
                'id': eventId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs can approve events`,
                404: `Event not found`,
            },
        });
    }

    /**
     * Cancel an event
     * @param eventId
     * @returns Event Event cancelled
     * @throws ApiError
     */
    public static postApiEventsIdCancel(
        eventId: number,
    ): CancelablePromise<Event> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/{id}/cancel',
            path: {
                'id': eventId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Only ADMINs or ORGANIZERs can cancel events`,
                404: `Event not found`,
            },
        });
    }
}
