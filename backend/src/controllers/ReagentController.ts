import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const ReagentController = {
  
  // LISTAR (Index)
  async index(req: Request, res: Response) {
    try {
      const reagents = await prisma.reagent.findMany({
        orderBy: { name: 'asc' }
      });
      
      // TRADUÇÃO: O banco retorna 'minQuantity', mas o frontend espera 'minStockLevel'
      // Mapeamos isso aqui para evitar erros visuais
      const formattedReagents = reagents.map(r => ({
        ...r,
        minStockLevel: r.minQuantity 
      }));

      return res.json(formattedReagents);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar reagentes" });
    }
  },

  // CRIAR (Create)
  async create(req: Request, res: Response) {
    try {
      const { 
        name, 
        casNumber, 
        category, 
        description, 
        formula, 
        quantity, 
        unit, 
        minStockLevel, // Frontend envia como minStockLevel
        location, 
        expirationDate, 
        isControlled 
      } = req.body;

      // Tratamento de Data
      let validDate = expirationDate ? new Date(expirationDate) : new Date();
      if (isNaN(validDate.getTime())) validDate = new Date();

      const newReagent = await prisma.reagent.create({
        data: {
          name,
          casNumber,
          category,
          description,
          formula,
          quantity: Number(quantity),
          unit: unit ? unit.toUpperCase() : 'UNID',
          // CORREÇÃO 1: Pega o valor enviado em vez de fixar em 10
          minQuantity: Number(minStockLevel), 
          location,
          expirationDate: validDate,
          // CORREÇÃO 2: Pega o valor do checkbox em vez de fixar false
          isControlled: Boolean(isControlled) 
        }
      });

      // Retorna formatado para o frontend já atualizar a lista corretamente
      return res.status(201).json({ ...newReagent, minStockLevel: newReagent.minQuantity });

    } catch (error) {
      console.error("Erro ao criar reagente:", error);
      return res.status(500).json({ error: "Erro ao criar reagente" });
    }
  },

  // ATUALIZAR (Update)
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name, 
        casNumber, 
        category, 
        description, 
        formula, 
        quantity, 
        unit, 
        minStockLevel, 
        location, 
        expirationDate, 
        isControlled 
      } = req.body;

      const dataToUpdate: any = {
        name,
        category,
        casNumber,
        formula,
        location,
        description,
        isControlled: Boolean(isControlled) // Garante atualização do status controlado
      };

      if (quantity !== undefined) dataToUpdate.quantity = Number(quantity);
      
      // CORREÇÃO 3: Atualiza o estoque mínimo se ele vier na requisição
      if (minStockLevel !== undefined) dataToUpdate.minQuantity = Number(minStockLevel);
      
      if (unit) dataToUpdate.unit = unit.toUpperCase();
      
      if (expirationDate) {
        const date = new Date(expirationDate);
        if (!isNaN(date.getTime())) dataToUpdate.expirationDate = date;
      }

      const updatedReagent = await prisma.reagent.update({
        where: { id },
        data: dataToUpdate
      });

      return res.json({ ...updatedReagent, minStockLevel: updatedReagent.minQuantity });

    } catch (error) {
      console.error("Erro ao atualizar reagente:", error);
      return res.status(500).json({ error: "Erro ao atualizar reagente" });
    }
  },

  // DELETAR (Delete)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.reagent.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      return res.status(500).json({ error: "Erro ao deletar reagente" });
    }
  }
};