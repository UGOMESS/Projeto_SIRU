// backend/src/controllers/DashboardController.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      // 1. Buscas diretas no Banco
      const [totalReagents, pendingRequests, wasteVolume, categoryGroups] = await Promise.all([
        // Conta total de reagentes
        prisma.reagent.count(),
        
        // Conta pedidos pendentes (usando .request conforme sua correção)
        prisma.request.count({
          where: { status: 'PENDING' }
        }),

        // Soma o volume de resíduos
        prisma.wasteLog.aggregate({
          _sum: { quantity: true }
        }),

        // --- NOVO: Agrupamento por Categoria para o Gráfico ---
        prisma.reagent.groupBy({
          by: ['category'],
          _count: {
            category: true,
          },
        })
      ]);

      // 2. Cálculo de Estoque Baixo
      // Buscamos apenas os campos necessários
      const allReagents = await prisma.reagent.findMany({
        select: { quantity: true, minQuantity: true } // Mantendo minQuantity conforme seu snippet
      });
      
      // Filtramos na memória: Quantidade atual < Quantidade mínima
      const lowStockCount = allReagents.filter((r: any) => r.quantity < r.minQuantity).length;

      // 3. Formata os dados de categoria para o frontend (Recharts)
      const categoryStats = categoryGroups.map(group => ({
        name: group.category,
        qtd: group._count.category
      }));

      return res.json({
        totalReagents,
        lowStockReagents: lowStockCount,
        pendingRequests,
        totalWaste: wasteVolume._sum.quantity || 0,
        categoryStats // <--- Enviando os dados reais para o gráfico
      });

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return res.status(500).json({ error: "Erro ao carregar dashboard" });
    }
  }
}