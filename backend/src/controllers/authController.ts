import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { successResponse, errorResponse } from '../utils/response';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return (errorResponse(res, 'Email and password are required', 400) as unknown) as void;
    }

    const userResult = await pool.query('SELECT id, name, email, password, role, is_active FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return (errorResponse(res, 'Invalid credentials', 401) as unknown) as void;
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return (errorResponse(res, 'User is inactive', 403) as unknown) as void;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return (errorResponse(res, 'Invalid credentials', 401) as unknown) as void;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'super_secret_jwt_key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userData } = user;

    return (successResponse(res, { user: userData, token }, 'Login successful') as unknown) as void;
  } catch (error: any) {
    console.error('Login error:', error);
    return (errorResponse(res, 'Internal server error', 500) as unknown) as void;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // In a stateless JWT setup, logout is handled client-side by discarding the token.
  // We can just return a success response here.
  return (successResponse(res, null, 'Logout successful') as unknown) as void;
};
