// Deleted: Internal API debug panel removed from production build.
export { };
export interface ApiLogEntry {
    id: string;
    timestamp: number;
    method: string;
    url: string;
    requestHeaders?: Record<string, string>;
    requestBody?: unknown;
    responseStatus?: number;
    responseHeaders?: Record<string, string>;
    responseBody?: unknown;
    duration?: number;
    error?: string;
}
