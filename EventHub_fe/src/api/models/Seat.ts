/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Event } from './Event';
import type { TicketType } from './TicketType';
export type Seat = {
    id?: number;
    section?: string;
    rowLabel?: string;
    seatNumber?: string;
    seatCategory?: string;
    isAvailable?: boolean;
    locked?: boolean;
    event?: Event;
    ticketType?: TicketType;
};

