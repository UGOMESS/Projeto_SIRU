// backend/src/routes.ts
import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';
// 1. Importando o Segurança (Middleware)
import { authMiddleware } from './middlewares/authMiddleware';

const router = Router();

// --- ROTA DE LOGIN (Pública) ---
router.post('/login', AuthController.authenticate);

// Rota de Teste
router.get('/', (req, res) => {
  res.send('API do SIRU está online! 🚀');
});

// --- Rotas de Reagentes ---

// GET: Leitura (Por enquanto deixamos pública, mas você pode bloquear se quiser)
router.get('/reagents', ReagentController.index);

// 2. Aplicando o authMiddleware nas rotas perigosas
// O fluxo agora é: Chega Requisição -> authMiddleware verifica -> Se OK, vai pro Controller
router.post('/reagents', authMiddleware, ReagentController.create);
router.put('/reagents/:id', authMiddleware, ReagentController.update);
router.delete('/reagents/:id', authMiddleware, ReagentController.delete);

export { router };