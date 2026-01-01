/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventStatus } from './EventStatus';
import type { Venue } from './Venue';
export type Event = {
    id?: number;
    organizerId?: string;
    name?: string;
    description?: string;
    category?: string;
    startTime?: string;
    endTime?: string;
    venue?: Venue;
    coverImage?: string;
    logoUrl?: string;
    bannerUrl?: string;
    organizerInfo?: any;
    status?: EventStatus;
    allowTicketTransfer?: boolean;
    allowAttendeeNameChange?: boolean;
    refundEnabled?: boolean;
    refundDeadlineHours?: number;
    refundFeePercent?: number;
    createdAt?: string;
    updatedAt?: string;
};

