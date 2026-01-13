// backend/src/routes.ts

import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';
import { RequestController } from './controllers/RequestController'; 
import { WasteController } from './controllers/WasteController';
import { DashboardController } from './controllers/DashboardController';
import { NewsController } from './controllers/NewsController';
import { UserController } from './controllers/UserController';
import { authMiddleware } from './middlewares/authMiddleware';
// 1. Importação do middleware de administrador
import { adminMiddleware } from './middlewares/adminMiddleware';

const router = Router();

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

// --- ROTAS DE USUÁRIOS (Gestão Administrativa) ---
// Qualquer usuário logado pode atualizar o próprio perfil (id próprio)
router.put('/users/:id', authMiddleware, UserController.update);

// APENAS ADMIN: Listar, Criar e Deletar usuários
router.get('/users', authMiddleware, adminMiddleware, UserController.index);
router.post('/users', authMiddleware, adminMiddleware, UserController.create);
router.delete('/users/:id', authMiddleware, adminMiddleware, UserController.delete);

// --- ROTAS DE REAGENTES ---
router.get('/reagents', ReagentController.index); 
router.post('/reagents', authMiddleware, adminMiddleware, ReagentController.create);
router.put('/reagents/:id', authMiddleware, adminMiddleware, ReagentController.update);
router.delete('/reagents/:id', authMiddleware, adminMiddleware, ReagentController.delete);

// --- ROTAS DE PEDIDOS (Requests) ---
router.post('/requests', authMiddleware, RequestController.create);
router.get('/requests', authMiddleware, RequestController.index);
// Apenas Admin aprova ou altera status de pedidos
router.patch('/requests/:id/status', authMiddleware, adminMiddleware, RequestController.updateStatus);

// --- ROTAS DE GESTÃO DE RESÍDUOS ---
// 1. Bombonas (Ações de escrita restritas a Admin)
router.get('/waste/containers', authMiddleware, WasteController.getContainers);
router.post('/waste/containers', authMiddleware, adminMiddleware, WasteController.createContainer);
router.put('/waste/containers/:id', authMiddleware, adminMiddleware, WasteController.updateContainer);
router.delete('/waste/containers/:id', authMiddleware, adminMiddleware, WasteController.deleteContainer);

// 2. Registros de Descarte (Qualquer pesquisador logado pode registrar descarte)
router.get('/waste/logs', authMiddleware, WasteController.getLogs);
router.post('/waste/logs', authMiddleware, WasteController.createLog);

export { router };