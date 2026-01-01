/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationStatus } from './OrganizationStatus';
import type { UserDto } from './UserDto';
export type OrganizationResponse = {
    id?: string;
    name?: string;
    description?: string;
    contactEmail?: string;
    owner?: UserDto;
    status?: OrganizationStatus;
    createdAt?: string;
    updatedAt?: string;
};

