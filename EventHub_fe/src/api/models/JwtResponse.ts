/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserOrganizationRoleDto } from './UserOrganizationRoleDto';
export type JwtResponse = {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    id?: string;
    fullName?: string;
    email?: string;
    roles?: Array<{
        authority: string;
    }>;
    permissions?: Array<string>;
    organizationRoles?: Array<UserOrganizationRoleDto>;
};

