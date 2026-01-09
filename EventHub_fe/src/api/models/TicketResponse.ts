/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TicketResponse = {
    id?: number;
    orderId?: number;
    eventId?: number;
    userId?: string;
    seatId?: number;
    seatLabel?: string;
    ticketCode?: string;
    showtimeCode?: string;
    eventName?: string;
    eventCategory?: string;
    attendeeName?: string;
    attendeeEmail?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    ticketType?: {
        id?: number;
        code?: string;
        name?: string;
    };
    showtime?: {
        id?: number;
        code?: string;
        startTime?: string;
        endTime?: string;
    };
};
