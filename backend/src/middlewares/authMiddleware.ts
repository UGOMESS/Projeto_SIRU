// backend/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Em produção, isso deve vir do .env
const JWT_SECRET = process.env.JWT_SECRET || 'unilab-siru-secret-key-2025';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O formato vem como "Bearer eyJhbGciOiJIUzI1Ni..."
  // Precisamos separar a palavra "Bearer" do token
  const parts = authorization.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do Token' });
  }

  const [schema, token] = parts;

  if (schema !== 'Bearer') {
    return res.status(401).json({ error: 'Token malformado' });
  }

  try {
    // Verifica a assinatura do Token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Força a tipagem para o nosso payload
    const { id, role } = decoded as TokenPayload;

    // Usamos (req as any) para driblar a verificação estrita temporariamente
(req as any).userId = id;
(req as any).userRole = role;

    return next(); // Pode passar!
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}