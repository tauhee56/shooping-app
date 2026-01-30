"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const ApiError_1 = require("../common/http/ApiError");
const logger_1 = require("../common/logging/logger");
function errorHandler(err, req, res, next) {
    const apiError = err instanceof ApiError_1.ApiError ? err : undefined;
    const statusCode = apiError?.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
    const log = req.log || logger_1.logger;
    log.error({
        statusCode,
        details: apiError?.details,
        err,
    }, apiError?.message || err?.message || 'Server Error');
    res.status(statusCode).json({
        message: apiError?.message || err?.message || 'Server Error',
        ...(process.env.NODE_ENV !== 'production' && apiError?.details !== undefined
            ? { details: apiError.details }
            : {}),
    });
}
