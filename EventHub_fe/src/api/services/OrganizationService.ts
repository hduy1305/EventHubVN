/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Organization } from '../models/Organization';
import type { OrganizationResponse } from '../models/OrganizationResponse';
import type { UserOrganizationRole } from '../models/UserOrganizationRole';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationService {
    /**
     * Get all organizations (Admin only)
     * @returns Organization List of organizations
     * @throws ApiError
     */
    public static getApiOrganizations(): CancelablePromise<Array<Organization>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/organizations',
            errors: {
                403: `Forbidden - Only ADMINs can access`,
            },
        });
    }
    /**
     * Create a new organization (Authenticated users)
     * @param ownerUserId
     * @param requestBody
     * @returns OrganizationResponse Organization created
     * @throws ApiError
     */
    public static postApiOrganizations(
        ownerUserId: string,
        requestBody: Organization,
    ): CancelablePromise<OrganizationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/organizations',
            query: {
                'ownerUserId': ownerUserId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get organization by ID (Admin or organization member)
     * @param id
     * @returns Organization Organization details
     * @throws ApiError
     */
    public static getApiOrganizations1(
        id: string,
    ): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/organizations/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden - Not an ADMIN or member`,
                404: `Organization not found`,
            },
        });
    }
    /**
     * Update organization (Admin or owner)
     * @param id
     * @param requestBody
     * @returns Organization Organization updated
     * @throws ApiError
     */
    public static putApiOrganizations(
        id: string,
        requestBody: Organization,
    ): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/organizations/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden - Not an ADMIN or owner`,
                404: `Organization not found`,
            },
        });
    }
    /**
     * Delete organization (Admin only)
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteApiOrganizations(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/organizations/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden - Only ADMINs can delete`,
                404: `Organization not found`,
            },
        });
    }
    /**
     * Add user to an organization with a specific role (Admin or organization owner)
     * @param organizationId
     * @param userId
     * @param roleId
     * @returns UserOrganizationRole User added to organization with role
     * @throws ApiError
     */
    public static postApiOrganizationsUsersRoles(
        organizationId: string,
        userId: string,
        roleId: number,
    ): CancelablePromise<UserOrganizationRole> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/organizations/{organizationId}/users/{userId}/roles/{roleId}',
            path: {
                'organizationId': organizationId,
                'userId': userId,
                'roleId': roleId,
            },
            errors: {
                403: `Forbidden - Not an ADMIN or owner`,
                404: `Organization, User, or Role not found`,
            },
        });
    }

    /**
     * Add user to an organization with a role name (Admin or organization owner)
     * @param organizationId
     * @param userId
     * @param roleName
     * @returns UserOrganizationRole User added to organization with role
     * @throws ApiError
     */
    public static postApiOrganizationsUsersRolesByName(
        organizationId: string,
        userId: string,
        roleName: string,
    ): CancelablePromise<UserOrganizationRole> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/organizations/{organizationId}/users/{userId}/roles/by-name',
            path: {
                'organizationId': organizationId,
                'userId': userId,
            },
            query: {
                'roleName': roleName,
            },
            errors: {
                403: `Forbidden - Not an ADMIN or owner`,
                404: `Organization, User, or Role not found`,
            },
        });
    }
    /**
     * Update a user's role within an organization (Admin or organization owner of the role)
     * @param userOrgRoleId
     * @param newRoleId
     * @returns UserOrganizationRole User's organization role updated
     * @throws ApiError
     */
    public static putApiOrganizationsUserOrganizationRolesRoles(
        userOrgRoleId: number,
        newRoleId: number,
    ): CancelablePromise<UserOrganizationRole> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/organizations/user-organization-roles/{userOrgRoleId}/roles/{newRoleId}',
            path: {
                'userOrgRoleId': userOrgRoleId,
                'newRoleId': newRoleId,
            },
            errors: {
                403: `Forbidden - Not an ADMIN or owner of the associated organization`,
                404: `UserOrganizationRole or new Role not found`,
            },
        });
    }
    /**
     * Remove a user's role from an organization (Admin or organization owner of the role)
     * @param userOrgRoleId
     * @returns void
     * @throws ApiError
     */
    public static deleteApiOrganizationsUserOrganizationRoles(
        userOrgRoleId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/organizations/user-organization-roles/{userOrgRoleId}',
            path: {
                'userOrgRoleId': userOrgRoleId,
            },
            errors: {
                403: `Forbidden - Not an ADMIN or owner of the associated organization`,
                404: `UserOrganizationRole not found`,
            },
        });
    }
    /**
     * Get users and their roles within a specific organization (Admin or organization member)
     * @param organizationId
     * @returns UserOrganizationRole List of users and their roles in the organization
     * @throws ApiError
     */
    public static getApiOrganizationsUsersRoles(
        organizationId: string,
    ): CancelablePromise<Array<UserOrganizationRole>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/organizations/{organizationId}/users-roles',
            path: {
                'organizationId': organizationId,
            },
            errors: {
                403: `Forbidden - Not an ADMIN or member`,
                404: `Organization not found`,
            },
        });
    }
    /**
     * Get organizations and roles for a specific user (User themselves or Admin)
     * @param userId
     * @returns UserOrganizationRole List of organizations and roles for the user
     * @throws ApiError
     */
    public static getApiOrganizationsUserOrganizationsRoles(
        userId: string,
    ): CancelablePromise<Array<UserOrganizationRole>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/organizations/user/{userId}/organizations-roles',
            path: {
                'userId': userId,
            },
            errors: {
                403: `Forbidden - Not the user themselves or ADMIN`,
                404: `User not found`,
            },
        });
    }
}
