// backend/src/controllers/RequestController.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  }
}

export class RequestController {
  
  // 1. Criar Pedido
  static async create(req: Request, res: Response) {
    const userId = (req as AuthRequest).user?.id || (req as any).userId;
    // ATUALIZAÇÃO: Capturando reason e usageDate
    const { items, reason, usageDate } = req.body; 

    if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "O pedido deve conter pelo menos um item." });
      }

      // Validação de estoque
      for (const item of items) {
        const reagent = await prisma.reagent.findUnique({ where: { id: item.reagentId } });
        
        if (!reagent) {
            return res.status(404).json({ error: `Reagente ID ${item.reagentId} não encontrado.` });
        }
        
        if (reagent.quantity < Number(item.quantity)) {
          return res.status(400).json({ error: `Estoque insuficiente para ${reagent.name}.` });
        }
      }

      const request = await prisma.request.create({
        data: {
          userId,
          status: 'PENDING',
          reason: reason || '', // ATUALIZAÇÃO: Salvando o motivo no banco
          items: {
            create: items.map((item: any) => ({
              reagentId: item.reagentId,
              quantity: Number(item.quantity)
            }))
          }
        },
        include: { items: true }
      });

      return res.status(201).json(request);

    } catch (error) {
      console.error(error); 
      return res.status(500).json({ error: "Erro ao criar pedido." });
    }
  }

  // 2. Listar Pedidos
  static async index(req: Request, res: Response) {
    const userId = (req as AuthRequest).user?.id || (req as any).userId;
    const userRole = (req as AuthRequest).user?.role || (req as any).user?.role;
    
    // ATUALIZAÇÃO: Pegando o filtro da URL
    const { onlyMine } = req.query;

    if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      // LÓGICA DE FILTRO ATUALIZADA:
      // Se for ADMIN e NÃO pediu "apenas meus", vê tudo (Central de Pedidos).
      // Se for ADMIN e pediu "apenas meus", vê só os dele.
      // Se for PESQUISADOR, vê só os dele (userId).
      const where = (userRole === 'ADMIN' && onlyMine !== 'true') ? {} : { userId };
      
      const requests = await prisma.request.findMany({
        where,
        include: { 
            user: { select: { name: true, email: true } },
            items: { include: { reagent: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(requests);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar pedidos." });
    }
  }

  // 3. Atualizar Status
  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const request = await prisma.request.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!request) return res.status(404).json({ error: "Pedido não encontrado." });

      if (status === 'REJECTED') {
         const updated = await prisma.request.update({ where: { id }, data: { status: 'REJECTED' } });
         return res.json(updated);
      }

      if (status === 'APPROVED') {
         const updated = await prisma.request.update({ where: { id }, data: { status: 'APPROVED' } });
         return res.json(updated);
      }

      if (status === 'COMPLETED') {
        for (const item of request.items) {
           const reagent = await prisma.reagent.findUnique({ where: { id: item.reagentId } });
           if (!reagent || reagent.quantity < item.quantity) {
              return res.status(400).json({ error: `Estoque insuficiente.` });
           }
        }

        await prisma.$transaction(async (tx) => {
           for (const item of request.items) {
              await tx.reagent.update({
                 where: { id: item.reagentId },
                 data: { quantity: { decrement: item.quantity } }
              });
           }
           await tx.request.update({ where: { id }, data: { status: 'COMPLETED' } });
        });

        return res.json({ message: "Retirada confirmada e estoque atualizado." });
      }

      return res.status(400).json({ error: "Status inválido." });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar status." });
    }
  }
}