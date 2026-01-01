/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Event } from './Event';
export type Discount = {
    id?: number;
    code?: string;
    discountPercent?: number;
    discountAmount?: number;
    minimumOrderAmount?: number;
    usageLimit?: number;
    usedCount?: number;
    validFrom?: string;
    validTo?: string;
    event?: Event;
};

