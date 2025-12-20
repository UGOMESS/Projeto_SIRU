// backend/src/routes.ts
import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';
import { AuthController } from './controllers/AuthController';

const router = Router();

// --- ROTA DE LOGIN ---
router.post('/login', AuthController.authenticate);

router.get('/', (req, res) => {
  res.send('API do SIRU está online! 🚀');
});

router.get('/reagents', ReagentController.index);
router.post('/reagents', ReagentController.create);
router.put('/reagents/:id', ReagentController.update);
router.delete('/reagents/:id', ReagentController.delete);

export { router };