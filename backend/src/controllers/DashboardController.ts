// backend/src/controllers/DashboardController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      // 1. Buscas diretas no Banco
      const [totalReagents, pendingRequests, wasteVolume] = await Promise.all([
        // Conta total de reagentes
        prisma.reagent.count(),
        
        // CORREÇÃO AQUI: Mudamos de .withdrawalRequest para .request
        // Conta pedidos pendentes
        prisma.request.count({
          where: { status: 'PENDING' }
        }),

        // Soma o volume de resíduos
        prisma.wasteLog.aggregate({
          _sum: { quantity: true }
        })
      ]);

      // 2. Cálculo de Estoque Baixo
      // Buscamos apenas os campos necessários
      const allReagents = await prisma.reagent.findMany({
        select: { quantity: true, minQuantity: true }
      });
      
      // Filtramos na memória: Quantidade atual < Quantidade mínima
      // Usamos (r: any) para evitar erros de tipagem momentâneos
      const lowStockCount = allReagents.filter((r: any) => r.quantity < r.minQuantity).length;

      return res.json({
        totalReagents,
        lowStockReagents: lowStockCount,
        pendingRequests,
        totalWaste: wasteVolume._sum.quantity || 0 
      });

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return res.status(500).json({ error: "Erro ao carregar dashboard" });
    }
  }
}