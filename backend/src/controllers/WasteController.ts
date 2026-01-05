// backend/src/controllers/WasteController.ts

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const WasteController = {
  
  // --- BOMBONAS (Containers) ---

  // 1. Listar Bombonas (Para ver quais estão disponíveis)
  async getContainers(req: Request, res: Response) {
    try {
      const containers = await prisma.wasteContainer.findMany({
        orderBy: { identifier: 'asc' }
      });
      return res.json(containers);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar bombonas.' });
    }
  },

  // 2. Criar Nova Bombona (Admin)
  async createContainer(req: Request, res: Response) {
    try {
      const { identifier, type, capacity, location } = req.body;

      const container = await prisma.wasteContainer.create({
        data: {
          identifier,     // Ex: "B-01"
          type,           // Ex: "Solventes Orgânicos"
          capacity: Number(capacity),
          currentVolume: 0, // Começa vazia
          location,
          isActive: true
        }
      });

      return res.status(201).json(container);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar bombona.' });
    }
  },

  // --- LOGS DE DESCARTE ---

  // 3. Registrar um Descarte (A Mágica acontece aqui!)
  async createLog(req: Request, res: Response) {
    try {
      const { description, quantity, containerId } = req.body;
      const userId = (req as any).userId; // Pega o ID do usuário logado (via Token)

      // Validação básica
      if (!description || !quantity || !containerId) {
        return res.status(400).json({ error: 'Dados incompletos.' });
      }

      const qtd = Number(quantity);

      // Usamos Transaction para garantir que só salva o log se atualizar o volume da bombona (e vice-versa)
      const result = await prisma.$transaction(async (tx) => {
        
        // a) Busca a bombona
        const container = await tx.wasteContainer.findUnique({ 
            where: { id: containerId } 
        });

        if (!container) throw new Error("Bombona não encontrada.");
        if (!container.isActive) throw new Error("Esta bombona está fechada/inativa.");

        // b) Verifica capacidade (Opcional, mas bom ter)
        if (container.currentVolume + qtd > container.capacity) {
            throw new Error("Capacidade da bombona excedida!");
        }

        // c) Atualiza o volume da bombona
        await tx.wasteContainer.update({
            where: { id: containerId },
            data: { currentVolume: { increment: qtd } }
        });

        // d) Cria o registro de log
        const log = await tx.wasteLog.create({
            data: {
                description,
                quantity: qtd,
                userId,
                containerId
            }
        });

        return log;
      });

      return res.status(201).json(result);

    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ error: error.message || 'Erro ao registrar descarte.' });
    }
  },

  // 4. Listar Histórico de Descartes
  async getLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.wasteLog.findMany({
        orderBy: { date: 'desc' },
        include: {
          user: { select: { name: true } }, // Traz o nome de quem descartou
          container: { select: { identifier: true, type: true } } // Traz onde foi jogado
        }
      });
      return res.json(logs);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
  }
};