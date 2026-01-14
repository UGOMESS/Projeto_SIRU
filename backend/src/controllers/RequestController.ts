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
    const { items, reason, usageDate } = req.body; 

    if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "O pedido deve conter pelo menos um item." });
      }

      // Validação de estoque prévia
      for (const item of items) {
        const reagent = await prisma.reagent.findUnique({ where: { id: item.reagentId } });
        
        if (!reagent) {
            return res.status(404).json({ error: `Reagente ID ${item.reagentId} não encontrado.` });
        }
        
        if (reagent.quantity < Number(item.quantity)) {
          return res.status(400).json({ error: `Estoque insuficiente para ${reagent.name}.` });
        }
      }

      // TRATAMENTO DA DATA: Forçamos a data para o meio do dia (12:00) 
      // para evitar que o fuso horário mude o dia durante a conversão.
      const normalizedUsageDate = usageDate ? new Date(`${usageDate}T12:00:00`) : null;

      const request = await prisma.request.create({
        data: {
          userId,
          status: 'PENDING',
          reason: reason || '', 
          usageDate: normalizedUsageDate,
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
      console.error("Erro ao criar pedido:", error); 
      return res.status(500).json({ error: "Erro ao criar pedido no banco de dados." });
    }
  }

  // 2. Listar Pedidos
  static async index(req: Request, res: Response) {
    const userId = (req as AuthRequest).user?.id || (req as any).userId;
    const userRole = (req as AuthRequest).user?.role || (req as any).user?.role;
    const { onlyMine } = req.query;

    if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const where = (userRole === 'ADMIN' && onlyMine !== 'true') ? {} : { userId };
      
      const requests = await prisma.request.findMany({
        where,
        include: { 
            user: { select: { name: true, email: true } },
            items: { include: { reagent: true } }
        },
        orderBy: { createdAt: 'desc' } // Mantém a ordem de chegada
      });
      return res.json(requests);

    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
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

      if (status === 'REJECTED' || status === 'APPROVED') {
         const updated = await prisma.request.update({ 
           where: { id }, 
           data: { status } 
         });
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
           await tx.request.update({ 
             where: { id }, 
             data: { status: 'COMPLETED' } 
           });
        });

        return res.json({ message: "Retirada confirmada e estoque atualizado." });
      }

      return res.status(400).json({ error: "Status inválido." });

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      return res.status(500).json({ error: "Erro interno ao processar alteração de status." });
    }
  }
}