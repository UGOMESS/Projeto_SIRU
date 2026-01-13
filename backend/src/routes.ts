// backend/src/routes.ts

import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';
import { RequestController } from './controllers/RequestController'; 
import { WasteController } from './controllers/WasteController';
import { DashboardController } from './controllers/DashboardController';
import { NewsController } from './controllers/NewsController';
// 1. Importação do novo Controller de Usuário
import { UserController } from './controllers/UserController';
import { authMiddleware } from './middlewares/authMiddleware';

const router = Router();
const userController = new UserController(); // Instância da classe

// --- ROTA DE LOGIN (Pública) ---
router.post('/login', AuthController.authenticate);

// Rota de Teste de Saúde da API
router.get('/', (req, res) => {
  res.send('API do SIRU está online! 🚀');
});

// --- ROTA DO DASHBOARD ---
router.get('/dashboard/stats', authMiddleware, DashboardController.getStats);

// Rota de Notícias (Scraping da Unilab)
router.get('/news', authMiddleware, NewsController.getNews);

// --- ROTAS DE USUÁRIOS (NOVO) ---
// Rota para atualizar perfil (Nome/Senha)
router.put('/users/:id', authMiddleware, userController.update);

// --- ROTAS DE REAGENTES ---
// (Index é público para consulta, demais ações requerem login)
router.get('/reagents', ReagentController.index); 
router.post('/reagents', authMiddleware, ReagentController.create);
router.put('/reagents/:id', authMiddleware, ReagentController.update);
router.delete('/reagents/:id', authMiddleware, ReagentController.delete);

// --- ROTAS DE PEDIDOS (Requests) ---
// Responsáveis pelo fluxo: Solicitar -> Aprovar -> Baixar Estoque
router.post('/requests', authMiddleware, RequestController.create);
router.get('/requests', authMiddleware, RequestController.index);
router.patch('/requests/:id/status', authMiddleware, RequestController.updateStatus);

// --- ROTAS DE GESTÃO DE RESÍDUOS ---

// 1. Bombonas (Containers)
router.get('/waste/containers', authMiddleware, WasteController.getContainers);
router.post('/waste/containers', authMiddleware, WasteController.createContainer);
router.put('/waste/containers/:id', authMiddleware, WasteController.updateContainer);
router.delete('/waste/containers/:id', authMiddleware, WasteController.deleteContainer);

// 2. Registros de Descarte (Logs)
router.get('/waste/logs', authMiddleware, WasteController.getLogs);
router.post('/waste/logs', authMiddleware, WasteController.createLog);

export { router };