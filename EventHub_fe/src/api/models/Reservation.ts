/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReservationStatus } from './ReservationStatus';
export type Reservation = {
    id?: number;
    userId?: string;
    eventId?: number;
    ticketTypeId?: number;
    seatId?: number;
    quantity?: number;
    expireAt?: string;
    status?: ReservationStatus;
};

