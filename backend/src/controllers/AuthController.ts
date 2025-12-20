// backend/src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Em produção, isso deve estar no arquivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'unilab-siru-secret-key-2025';

export const AuthController = {
  async authenticate(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 1. Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' });
      }

      // 2. Verificar se a senha bate (comparar Hash)
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' });
      }

      // 3. Gerar o Token JWT (O "Crachá")
      // Esse token guarda o ID e o ROLE do usuário e expira em 1 dia
      const token = jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // 4. Remover a senha do objeto antes de enviar de volta
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error("Erro na autenticação:", error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
};