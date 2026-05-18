export type AppErrorDetails = Record<string, unknown> | unknown;

export class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: AppErrorDetails;

    constructor(code: string, statusCode: number, message: string, details?: AppErrorDetails) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}
