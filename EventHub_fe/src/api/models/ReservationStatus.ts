/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export const ReservationStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
} as const;

export type ReservationStatus = typeof ReservationStatus[keyof typeof ReservationStatus];
