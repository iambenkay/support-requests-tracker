import e from "express";

export enum AuthRole {
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER",
    SUPPORT_AGENT = "SUPPORT_AGENT",
}

export enum HttpMethod {
    GET = "get",
    POST = "post",
    DELETE = "delete",
    PUT = "put",
}

export enum TicketStatus {
    UNATTENDED = "UNATTENDED",
    REPLIED = "REPLIED",
    RESOLVED = "RESOLVED",
}

export type ClaimPurpose = 'authentication'

export interface AuthClaim {
    id: string;
    role: AuthRole;
    purpose: ClaimPurpose;
}

export interface ControllerData {
    body: {[key: string]: any};
    params: {[key: string]: any};
    query: {[key: string]: any};
    headers: {[key: string]: any};
    claims?: AuthClaim;
    response?: e.Response;
    page?: PageParams;
}

export enum SortDirection {
    ASC = 1,
    DESC = -1
}

export interface PageParams {
    page?: number,
    limit?: number,
    sort?: string,
    direction?: SortDirection,
}