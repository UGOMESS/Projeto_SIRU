// backend/src/routes.ts
import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';
import { RequestController } from './controllers/RequestController'; 
import { WasteController } from './controllers/WasteController';
import { DashboardController } from './controllers/DashboardController';
import { NewsController } from './controllers/NewsController';
import { authMiddleware } from './middlewares/authMiddleware';

const router = Router();

// --- ROTA DE LOGIN (Pública) ---
router.post('/login', AuthController.authenticate);

// Rota de Teste
router.get('/', (req, res) => {
  res.send('API do SIRU está online! 🚀');
});

// --- ROTA DO DASHBOARD ---
router.get('/dashboard/stats', authMiddleware, DashboardController.getStats);

// Rota de Notícias (Scraping da Unilab)
router.get('/news', authMiddleware, NewsController.getNews);

// --- ROTAS DE REAGENTES ---
router.get('/reagents', ReagentController.index);
router.post('/reagents', authMiddleware, ReagentController.create);
router.put('/reagents/:id', authMiddleware, ReagentController.update);
router.delete('/reagents/:id', authMiddleware, ReagentController.delete);

// --- ROTAS DE PEDIDOS (Requests) ---
router.post('/requests', authMiddleware, RequestController.create);
router.get('/requests', authMiddleware, RequestController.index);
router.patch('/requests/:id/status', authMiddleware, RequestController.updateStatus);

// --- ROTAS DE GESTÃO DE RESÍDUOS ---

// 1. Bombonas (Containers)
router.get('/waste/containers', authMiddleware, WasteController.getContainers);
router.post('/waste/containers', authMiddleware, WasteController.createContainer);

// NOVAS ROTAS (Editar e Excluir Bombonas)
router.put('/waste/containers/:id', authMiddleware, WasteController.updateContainer);
router.delete('/waste/containers/:id', authMiddleware, WasteController.deleteContainer);

// 2. Registros de Descarte (Logs)
router.get('/waste/logs', authMiddleware, WasteController.getLogs);
router.post('/waste/logs', authMiddleware, WasteController.createLog);

export { router };