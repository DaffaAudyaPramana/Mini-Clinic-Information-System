"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const response_1 = require("../utils/response");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.errorResponse)(res, 'Email and password are required', 400);
        }
        const userResult = await db_1.pool.query('SELECT id, name, email, password, role, is_active FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return (0, response_1.errorResponse)(res, 'Invalid credentials', 401);
        }
        const user = userResult.rows[0];
        if (!user.is_active) {
            return (0, response_1.errorResponse)(res, 'User is inactive', 403);
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return (0, response_1.errorResponse)(res, 'Invalid credentials', 401);
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'super_secret_jwt_key', { expiresIn: '24h' });
        const { password: _, ...userData } = user;
        return (0, response_1.successResponse)(res, { user: userData, token }, 'Login successful');
    }
    catch (error) {
        console.error('Login error:', error);
        return (0, response_1.errorResponse)(res, 'Internal server error', 500);
    }
};
exports.login = login;
const logout = async (req, res) => {
    // In a stateless JWT setup, logout is handled client-side by discarding the token.
    // We can just return a success response here.
    return (0, response_1.successResponse)(res, null, 'Logout successful');
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map