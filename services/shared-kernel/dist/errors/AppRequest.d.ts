export interface AppRequest {
    params: Record<string, string>;
    body: Record<string, any>;
    query: Record<string, string>;
    headers?: Record<string, string>;
}
