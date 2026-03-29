import { ERROR_CODES } from "../constants/index.js";

class ApiError extends Error {
    constructor(
        message = "Something went wrong",
        {
            statusCode = 500,
            code = ERROR_CODES.INTERNAL_ERROR,
            errors = [],      // field-level errors: [{ field, message }]
            data = null,      // optional payload (rare, but useful)
            stack = "",
            requestId = null, // trace ID from req.id (e.g. express-request-id)
        } = {}
    ) {
        super(message);

        // Standard Error fields
        this.name = this.constructor.name; // "ValidationError", "NotFoundError" etc.

        // HTTP
        this.statusCode = statusCode;

        // App-level
        this.code = code;
        this.errors = errors;
        this.data = data;
        this.success = false;
        this.timestamp = new Date().toISOString(); 
        this.requestId = requestId;               

        // Stack trace — exclude constructor from trace for cleaner logs
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            success: false,
            statusCode: this.statusCode,
            code: this.code,
            message: this.message,
            errors: this.errors,
            data: this.data,
            timestamp: this.timestamp,
            requestId: this.requestId,
            // Only send stack in development — NEVER expose in production
            ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
        };
    }

    /**
     * Static factory — for when you catch an unknown error and want
     * to wrap it safely without losing the original stack.
     *
     * Usage: throw ApiError.from(unknownError)
     */
    static from(error, options = {}) {
        if (error instanceof ApiError) return error; // already structured
        return new ApiError(error.message || "Unexpected error", {
            stack: error.stack,
            ...options,
        });
    }
}

// ─── Specific Error Subclasses 

class BadRequestError extends ApiError {
    constructor(message = "Bad Request", options = {}) {
        super(message, {
            statusCode: 400,
            code: ERROR_CODES.BAD_REQUEST_ERROR,
            ...options,
        });
    }
}

class NotFoundError extends ApiError {
    constructor(message = "Resource Not Found", options = {}) {
        super(message, {
            statusCode: 404,
            code: ERROR_CODES.NOT_FOUND_ERROR,
            ...options,
        });
    }
}

class ValidationError extends ApiError {
    constructor(message = "Validation Failed", errors = [], options = {}) {
        super(message, {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            errors,
            ...options,
        });
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized", options = {}) {
        super(message, {
            statusCode: 401,
            code: ERROR_CODES.AUTH_FAILED,
            ...options,
        });
    }
}

class ForbiddenError extends ApiError {
    constructor(message = "Access Denied", options = {}) {
        super(message, {
            statusCode: 403,
            code: ERROR_CODES.AUTH_FORBIDDEN,
            ...options,
        });
    }
}

class ConflictError extends ApiError {
    constructor(message = "Conflict", options = {}) {
        super(message, {
            statusCode: 409,
            code: ERROR_CODES.CONFLICT_ERROR,
            ...options,
        });
    }
}

export {
    ApiError,
    BadRequestError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
};