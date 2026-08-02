import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        name: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorizeRole: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map