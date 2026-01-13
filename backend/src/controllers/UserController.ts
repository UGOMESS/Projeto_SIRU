import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 
import { hash } from 'bcryptjs';

export class UserController {
  
  // 1. LISTAR USUÁRIOS (Para a tabela do Admin)
  static async index(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar lista de usuários." });
    }
  }

  // 2. CRIAR USUÁRIO (O modelo de "Criação pelo Admin")
  static async create(req: Request, res: Response) {
    const { name, email, password, role } = req.body;

    try {
      const userExists = await prisma.user.findUnique({ where: { email } });
      
      if (userExists) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
      }

      const passwordHash = await hash(password, 8);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role: role || 'RESEARCHER'
        },
        select: { id: true, name: true, email: true, role: true }
      });

      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar novo usuário." });
    }
  }

  // 3. ATUALIZAR USUÁRIO (Seu código original ajustado)
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, password, role } = req.body; // Admin também pode mudar o cargo (role)

    try {
      const user = await prisma.user.findUnique({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const dataToUpdate: any = { name };
      
      // Se for Admin logado, ele pode alterar o cargo de outros
      if (role) dataToUpdate.role = role;

      if (password) {
        dataToUpdate.password = await hash(password, 8);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: { id: true, name: true, email: true, role: true }
      });

      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno ao atualizar perfil." });
    }
  }

  // 4. DELETAR USUÁRIO
  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Opcional: Impedir que o admin delete a si mesmo
      const adminId = (req as any).user?.id;
      if (id === adminId) {
        return res.status(400).json({ error: "Você não pode excluir sua própria conta administrativa." });
      }

      await prisma.user.delete({ where: { id } });
      return res.json({ message: "Usuário removido com sucesso." });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao excluir usuário." });
    }
  }
}