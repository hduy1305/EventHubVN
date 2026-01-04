/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export const TicketStatus = {
    ISSUED: 'ISSUED',
    SCANNED: 'SCANNED',
    REFUNDED: 'REFUNDED',
    TRANSFERRED: 'TRANSFERRED',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];
