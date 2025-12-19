// backend/src/controllers/ReagentController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const ReagentController = {
  // Listar todos
  async index(req: Request, res: Response) {
    try {
      const reagents = await prisma.reagent.findMany({
        orderBy: { createdAt: 'desc' } // Ordena para os novos aparecerem primeiro
      });
      return res.json(reagents);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar reagentes' });
    }
  },

  // Criar novo
  async create(req: Request, res: Response) {
    try {
      const { 
        name, category, quantity, unit, expirationDate,
        casNumber, formula, location,
        description 
      } = req.body;

      // Tratamento de Data e Unidade
      let validDate = expirationDate ? new Date(expirationDate) : new Date();
      if (isNaN(validDate.getTime())) validDate = new Date();
      const validUnit = unit ? unit.toUpperCase() : 'UNID';

      const newReagent = await prisma.reagent.create({
        data: {
          name,
          category,
          quantity: Number(quantity),
          unit: validUnit as any,
          minQuantity: 10,
          expirationDate: validDate,
          isControlled: false,
          casNumber, 
          formula,   
          location,
          description
        }
      });

      return res.status(201).json(newReagent);
    } catch (error) {
      console.error("Erro ao criar reagente:", error);
      return res.status(500).json({ error: 'Erro ao criar reagente' });
    }
  },

  // --- NOVA FUNÇÃO: ATUALIZAR (UPDATE) ---
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name, category, quantity, unit, expirationDate,
        casNumber, formula, location, description, minQuantity 
      } = req.body;

      // Objeto de dados para atualizar
      const dataToUpdate: any = {
        name,
        category,
        casNumber,
        formula,
        location,
        description
      };

      // Tratamentos especiais de tipos (String -> Number/Date)
      if (quantity !== undefined) dataToUpdate.quantity = Number(quantity);
      if (minQuantity !== undefined) dataToUpdate.minQuantity = Number(minQuantity);
      if (unit) dataToUpdate.unit = unit.toUpperCase();
      
      if (expirationDate) {
        const date = new Date(expirationDate);
        if (!isNaN(date.getTime())) dataToUpdate.expirationDate = date;
      }

      const updatedReagent = await prisma.reagent.update({
        where: { id },
        data: dataToUpdate
      });

      return res.json(updatedReagent);
    } catch (error) {
      console.error("Erro ao atualizar reagente:", error);
      return res.status(500).json({ error: 'Erro ao atualizar reagente' });
    }
  },

  // --- DELETAR ---
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params; // Pega o ID da URL (ex: /reagents/123)

      await prisma.reagent.delete({
        where: { id }
      });

      // Retorna status 204 (No Content) indicando sucesso sem corpo de resposta
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar reagente:", error);
      return res.status(500).json({ error: 'Erro ao deletar reagente' });
    }
  }
};