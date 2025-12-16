import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; 

const app = express();
const prisma = new PrismaClient();

// Configurações
app.use(cors()); 
app.use(express.json()); 

const PORT = 3000;

// --- ROTAS ---

app.get('/', (req, res) => {
  res.send('API do SIRU está online! 🧪');
});

// Listar Reagentes
app.get('/reagents', async (req, res) => {
  try {
    const reagents = await prisma.reagent.findMany();
    res.json(reagents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar reagentes' });
  }
});

// Criar Reagente (POST) - CORRIGIDO
app.post('/reagents', async (req, res) => {
  try {
    const { name, category, quantity, unit, expirationDate } = req.body;

    // --- 1. Tratamento da Data ---
    // Se vier data, converte. Se não vier ou der erro, usa a data de hoje.
    let validDate = expirationDate ? new Date(expirationDate) : new Date();
    
    // Se a data for inválida (ex: string vazia), resetamos para hoje
    if (isNaN(validDate.getTime())) {
      console.log("Aviso: Data inválida recebida, usando data atual.");
      validDate = new Date(); 
    }

    // --- 2. Tratamento da Unidade ---
    // Transforma 'ml' em 'ML' para o banco não recusar
    const validUnit = unit ? unit.toUpperCase() : 'UNID';

    const newReagent = await prisma.reagent.create({
      data: {
        name,
        category,
        quantity: Number(quantity),
        unit: validUnit as any, 
        minQuantity: 10,
        expirationDate: validDate, // Usamos a data tratada
        isControlled: false 
      }
    });

    res.status(201).json(newReagent);
  } catch (error) {
    console.error("Erro no create:", error); 
    res.status(500).json({ error: 'Erro ao criar reagente' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});