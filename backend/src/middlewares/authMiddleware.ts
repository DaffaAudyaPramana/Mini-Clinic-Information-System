import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return (errorResponse(res, 'Unauthorized: Missing or invalid token', 401) as unknown) as void;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return (errorResponse(res, 'Unauthorized: Invalid token', 401) as unknown) as void;
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return (errorResponse(res, 'Forbidden: Insufficient permissions', 403) as unknown) as void;
    }
    next();
  };
};
