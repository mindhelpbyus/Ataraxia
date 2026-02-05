/**
 * Standardized Error Response Utility
 * 
 * Ensures consistent error format across all API responses:
 * { success: false, message: string, error?: any, code?: string }
 */

export interface StandardErrorResponse {
    success: false;
    message: string;
    error?: any;
    code?: string;
    status?: number;
}

export interface StandardSuccessResponse<T = any> {
    success: true;
    data?: T;
    message?: string;
}

export type StandardApiResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Create standardized error response
 */
export function createErrorResponse(
    message: string,
    error?: any,
    code?: string,
    status?: number
): StandardErrorResponse {
    return {
        success: false,
        message,
        error,
        code,
        status
    };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T = any>(
    data?: T,
    message?: string
): StandardSuccessResponse<T> {
    return {
        success: true,
        data,
        message
    };
}

/**
 * Normalize legacy error responses to standard format
 * Handles: { msg }, { message }, { error }
 */
export function normalizeErrorResponse(response: any): StandardErrorResponse {
    const message = response.message || response.msg || response.error || 'An error occurred';

    return createErrorResponse(
        message,
        response.error || response.details,
        response.code,
        response.status
    );
}
