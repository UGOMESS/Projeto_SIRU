// backend/src/middlewares/adminMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).user?.role;

  if (userRole !== 'ADMIN') {
    return res.status(403).json({ error: "Acesso negado. Requer privilégios de administrador." });
  }

  next();
};