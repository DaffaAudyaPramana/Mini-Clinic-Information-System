"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const express_1 = require("express");
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error,
    });
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.js.map