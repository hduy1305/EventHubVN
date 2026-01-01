/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JwtResponse } from '../models/JwtResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { SignupRequest } from '../models/SignupRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @param requestBody
     * @returns string Registration successful
     * @throws ApiError
     */
    public static postApiAuthSignup(
        requestBody: SignupRequest,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
            },
        });
    }
    /**
     * Authenticate user and get tokens
     * @param requestBody
     * @returns JwtResponse Successful login
     * @throws ApiError
     */
    public static postApiAuthLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<JwtResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Refresh access token
     * @param refreshToken
     * @returns JwtResponse Token refreshed
     * @throws ApiError
     */
    public static postApiAuthRefresh(
        refreshToken: string,
    ): CancelablePromise<JwtResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            query: {
                'refreshToken': refreshToken,
            },
            errors: {
                400: `Invalid refresh token`,
                401: `Unauthorized`,
            },
        });
    }
}
