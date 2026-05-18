import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/appError";
import { logger } from "../logger";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            details: err.details
        });
    }

    logger.error({ err }, "Unhandled error");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
}
