// backend/src/routes.ts
import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';
// Importando o Controlador de Pedidos
import { RequestController } from './controllers/RequestController'; 
// NOVO: Importando Controlador de Resíduos
import { WasteController } from './controllers/WasteController';
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

// Alterar Status (Aprovar/Recusar)
router.patch('/requests/:id/status', authMiddleware, RequestController.updateStatus);

// --- ROTAS DE GESTÃO DE RESÍDUOS (NOVO) ---
// 1. Bombonas (Containers)
router.get('/waste/containers', authMiddleware, WasteController.getContainers);
router.post('/waste/containers', authMiddleware, WasteController.createContainer);

// 2. Registros de Descarte (Logs)
router.get('/waste/logs', authMiddleware, WasteController.getLogs);
router.post('/waste/logs', authMiddleware, WasteController.createLog);

export { router };