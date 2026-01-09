/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * @returns any
     * @throws ApiError
     */
    public static getApiUsersMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }

    /**
     * Search for users by email or name
     * @param query 
     * @returns User 
     * @throws ApiError
     */
    public static searchUsers(
        query: string,
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/search',
            query: { 'query': query }
        });
    }

    /**
     * Check if a user exists by email
     * @param email
     * @returns boolean
     * @throws ApiError
     */
    public static getApiUsersExists(
        email: string,
    ): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/exists',
            query: { 'email': email }
        });
    }

    /**
     * Get user ID by email
     * @param email
     * @returns string
     * @throws ApiError
     */
    public static getApiUsersIdByEmail(
        email: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/id-by-email',
            query: { 'email': email }
        });
    }

    /**
     * Assign a user (staff) to an event
     * @param userId
     * @param eventId
     * @returns void
     * @throws ApiError
     */
    public static postApiUsersAssignedEvents(
        userId: string,
        eventId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/{userId}/assign-event/{eventId}',
            path: {
                'userId': userId,
                'eventId': eventId,
            },
            body: {}, // Add empty body for POST request
        });
    }

    /**
     * Get assigned events for a user (staff)
     * @param userId
     * @returns number[]
     * @throws ApiError
     */
    public static getApiUsersAssignedEvents(
        userId: string,
    ): CancelablePromise<Array<number>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{userId}/assigned-events',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * Unassign staff from an event
     * @param userId
     * @param eventId
     * @returns void
     * @throws ApiError
     */
    public static deleteApiUsersAssignedEvents(
        userId: string,
        eventId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{userId}/unassign-event/{eventId}',
            path: {
                'userId': userId,
                'eventId': eventId,
            },
        });
    }

    /**
     * Assign STAFF role to a user in an organization
     * @param userId
     * @param organizationId
     * @returns void
     * @throws ApiError
     */
    public static postApiUsersAssignRole(
        userId: string,
        organizationId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/{userId}/assign-role',
            path: {
                'userId': userId,
            },
            query: {
                'organizationId': organizationId,
            },
        });
    }
}
