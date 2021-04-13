export class Response {
    status: number;
    message: any;
    constructor(status: number, message: any) {
        this.status = status;
        this.message = message;
    }
}

export class Redirect {
    route: string;
    constructor(route: string) {
        this.route = route;
    }
}

export class ResponseError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
