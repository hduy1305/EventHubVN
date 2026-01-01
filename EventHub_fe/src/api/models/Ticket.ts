/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from './OrderItem';
import type { TicketStatus } from './TicketStatus';
export type Ticket = {
    id?: number;
    orderItem?: OrderItem;
    seatId?: number;
    ticketCode?: string;
    attendeeName?: string;
    attendeeEmail?: string;
    status?: TicketStatus;
    createdAt?: string;
    updatedAt?: string;
};

