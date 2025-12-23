import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const RequestController = {
  // 1. Criar um novo pedido
  async create(req: Request, res: Response) {
    try {
      const { reagentId, amount, reason } = req.body;
      const userId = (req as any).userId; 

      if (!reagentId || !amount) {
        return res.status(400).json({ error: 'Dados incompletos.' });
      }

      const reagent = await prisma.reagent.findUnique({ where: { id: reagentId } });
      if (!reagent) {
        return res.status(404).json({ error: 'Reagente não encontrado.' });
      }

      const newRequest = await prisma.request.create({
        data: {
          userId: userId,
          status: 'PENDING',
          reason: reason,
          items: {
            create: [
              {
                reagentId: reagentId,
                quantity: Number(amount)
              }
            ]
          }
        },
        include: {
          items: { include: { reagent: true } },
          user: { select: { name: true, email: true } }
        }
      });

      return res.status(201).json(newRequest);

    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      return res.status(500).json({ error: 'Erro interno.' });
    }
  },

  // 2. Listar pedidos (LIMPO)
  async index(req: Request, res: Response) {
    try {
      const { userRole, userId } = req as any;

      // Lógica de Permissão: ADMIN vê tudo, USER vê só os seus
      const isAdmin = userRole?.toString().toUpperCase() === 'ADMIN';
      const whereClause = isAdmin ? {} : { userId: userId };

      const requests = await prisma.request.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, role: true } },
          items: {
            include: { reagent: true }
          }
        }
      });

      return res.json(requests);

    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  },

  // 3. Atualizar Status (Aprovar/Recusar)
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validação básica do status
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
      }

      const existingRequest = await prisma.request.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!existingRequest) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      if (existingRequest.status !== 'PENDING') {
        return res.status(400).json({ error: 'Pedido já foi finalizado.' });
      }

      if (status === 'APPROVED') {
        // Transação: Atualiza Status E Baixa Estoque juntos
        await prisma.$transaction(async (tx) => {
          for (const item of existingRequest.items) {
            const reagent = await tx.reagent.findUnique({ where: { id: item.reagentId } });
            
            if (!reagent || reagent.quantity < item.quantity) {
              throw new Error(`Estoque insuficiente para o reagente ID: ${item.reagentId}`);
            }

            await tx.reagent.update({
              where: { id: item.reagentId },
              data: { quantity: { decrement: item.quantity } }
            });
          }

          await tx.request.update({
            where: { id },
            data: { status: 'APPROVED' }
          });
        });

        return res.json({ message: 'Pedido aprovado e estoque atualizado.' });

      } else {
        // Apenas recusa, sem mexer no estoque
        const updatedRequest = await prisma.request.update({
          where: { id },
          data: { status: 'REJECTED' }
        });
        return res.json(updatedRequest);
      }

    } catch (error: any) {
      console.error("Erro na atualização de status:", error);
      return res.status(400).json({ error: error.message || 'Erro ao processar solicitação.' });
    }
  }
};