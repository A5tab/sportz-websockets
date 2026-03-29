import multer from "multer";
import jsonwebtoken from "jsonwebtoken";
import {
    ApiError,
    BadRequestError,
    UnauthorizedError,
} from "../utils/ApiError.js";
import { ERROR_CODES } from "../constants/index.js";

const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = jsonwebtoken
const IS_DEV = process.env.NODE_ENV === "development";

const normalizeJwtError = (err) => {
    if (err instanceof TokenExpiredError) {
        return new UnauthorizedError("Session expired. Please login again.", {
            code: ERROR_CODES.AUTH_EXPIRED,
        });
    }
    // JsonWebTokenError, NotBeforeError → invalid/tampered token
    return new UnauthorizedError("Invalid token. Please login again.", {
        code: ERROR_CODES.AUTH_FAILED,
    });
};

const normalizeMulterError = (err) => {
    const MULTER_MESSAGES = {
        LIMIT_FILE_SIZE: "File size exceeds the allowed limit.",
        LIMIT_FILE_COUNT: "Too many files uploaded.",
        LIMIT_UNEXPECTED_FILE: "Unexpected file field received.",
        LIMIT_PART_COUNT: "Too many parts in the request.",
        LIMIT_FIELD_KEY: "Field name is too long.",
        LIMIT_FIELD_VALUE: "Field value is too long.",
        LIMIT_FIELD_COUNT: "Too many fields in the request.",
    };

    return new BadRequestError(
        MULTER_MESSAGES[err.code] ?? "File upload error."
    );
};

const normalizeDrizzleError = (err) => {
    // Postgres error codes are 5-digit strings on err.code
    // Drizzle doesn't wrap pg errors — they bubble up raw
    const PG = {
        "23505": { statusCode: 409, code: ERROR_CODES.CONFLICT_ERROR, message: "A record with this value already exists." },
        "23503": { statusCode: 409, code: ERROR_CODES.CONFLICT_ERROR, message: "Referenced resource does not exist." },
        "23502": { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: "A required field is missing." },
        "23514": { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: "A field value violates a constraint." },
        "08003": { statusCode: 503, code: ERROR_CODES.SERVICE_UNAVAILABLE, message: "Database connection lost." },
        "08006": { statusCode: 503, code: ERROR_CODES.SERVICE_UNAVAILABLE, message: "Database connection failed." },
        "57014": { statusCode: 503, code: ERROR_CODES.SERVICE_UNAVAILABLE, message: "Database query timed out." },
    };

    const known = PG[err.code];

    return new ApiError(
        known?.message ?? "A database error occurred.",
        {
            statusCode: known?.statusCode ?? 500,
            code: known?.code ?? ERROR_CODES.INTERNAL_ERROR,
            // preserve original pg error stack for logs
            stack: err.stack,
        }
    );
};

const errorHandler = (err, req, res, next) => {

    let apiError;

    if (err instanceof ApiError) {
        apiError = err;

    } else if (err instanceof multer.MulterError) {
        apiError = normalizeMulterError(err);

    } else if (
        err instanceof TokenExpiredError ||
        err instanceof JsonWebTokenError ||
        err instanceof NotBeforeError
    ) {
        apiError = normalizeJwtError(err);

    } else if (typeof err.code === "string" && /^\d{5}$/.test(err.code)) {
        // Raw postgres error — 5-digit string code like "23505"
        apiError = normalizeDrizzleError(err);

    } else {
        // Completely unknown — bug, unhandled promise, unexpected crash
        apiError = new ApiError(
            IS_DEV ? err.message : "Something went wrong.",
            {
                statusCode: err.statusCode ?? 500,
                code: ERROR_CODES.INTERNAL_ERROR,
                stack: err.stack,
            }
        );
    }

    console.error({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        statusCode: apiError.statusCode,
        code: apiError.code,
        message: err.message,
        stack: err.stack,
        requestId: req.id ?? null,
    });
    return res.status(apiError.statusCode).json(apiError);
};

export default errorHandler;
