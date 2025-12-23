// backend/src/routes.ts
import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';
// Importando o Controlador de Pedidos
import { RequestController } from './controllers/RequestController'; 
import { authMiddleware } from './middlewares/authMiddleware';

const router = Router();

// --- ROTA DE LOGIN (Pública) ---
router.post('/login', AuthController.authenticate);

// Rota de Teste
router.get('/', (req, res) => {
  res.send('API do SIRU está online! 🚀');
});

// --- Rotas de Reagentes ---
router.get('/reagents', ReagentController.index);
router.post('/reagents', authMiddleware, ReagentController.create);
router.put('/reagents/:id', authMiddleware, ReagentController.update);
router.delete('/reagents/:id', authMiddleware, ReagentController.delete);

// --- ROTAS DE PEDIDOS (Requests) ---
// Criar pedido (Qualquer um logado)
router.post('/requests', authMiddleware, RequestController.create);

// Listar pedidos (Admin vê tudo, Pesquisador vê os seus)
router.get('/requests', authMiddleware, RequestController.index);

// NOVO: Alterar Status (Aprovar/Recusar) ✅
// Isso permite que o Admin aprove o pedido e baixe o estoque
router.patch('/requests/:id/status', authMiddleware, RequestController.updateStatus);

export { router };