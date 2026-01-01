/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationStatus } from './OrganizationStatus';
import type { User } from './User';
export type Organization = {
    id?: string;
    name?: string;
    description?: string;
    contactEmail?: string;
    owner?: User;
    status?: OrganizationStatus;
    cancellationPolicy?: string;
    refundPolicy?: string;
    supportedPaymentMethods?: string;
    feesAndTaxes?: string;
    createdAt?: string;
    updatedAt?: string;
};

