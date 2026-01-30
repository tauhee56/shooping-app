"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
function notFound(req, res, next) {
    res.status(404);
    next(new Error(`Not Found - ${req.originalUrl}`));
}
