// backend/src/controllers/UserController.ts

import { Request, Response } from 'express';
// CORREÇÃO AQUI: O caminho correto baseado na sua estrutura é ../lib/prisma
import { prisma } from '../lib/prisma'; 
import { hash } from 'bcryptjs';

export class UserController {
  
  // Método para atualizar dados do usuário
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, password } = req.body;

    try {
      // 1. Verifica se o usuário existe no banco
      const user = await prisma.user.findUnique({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // 2. Prepara o objeto de dados para atualizar
      const dataToUpdate: any = { name };

      // 3. Se o usuário mandou uma nova senha, criptografa antes de salvar
      if (password) {
        const passwordHash = await hash(password, 8);
        dataToUpdate.password = passwordHash;
      }

      // 4. Atualiza no Banco de Dados
      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true 
          // Não retornamos a senha por segurança
        }
      });

      return res.json(updatedUser);

    } catch (error) {
      console.error("Erro no update de usuário:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar perfil." });
    }
  }
}