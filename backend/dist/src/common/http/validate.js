"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const ApiError_1 = require("./ApiError");
function validate(schema) {
    return (req, res, next) => {
        try {
            const params = req.params && typeof req.params === 'object' ? { ...req.params } : {};
            const query = req.query && typeof req.query === 'object' && !Array.isArray(req.query) ? { ...req.query } : {};
            const parsed = schema.parse({
                body: req.body,
                params,
                query,
            });
            if (parsed.body !== undefined)
                req.body = parsed.body;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                next(new ApiError_1.ApiError(400, 'Validation error', err.flatten()));
                return;
            }
            next(new ApiError_1.ApiError(400, 'Validation error', err));
        }
    };
}
