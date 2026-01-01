/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TicketInfoDto } from './TicketInfoDto';
export type CheckInLogDto = {
    id?: number;
    eventId?: number;
    userId?: string;
    checkInTime?: string;
    gate?: string;
    deviceId?: string;
    ticket?: TicketInfoDto;
};

