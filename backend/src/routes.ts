// backend/src/routes.ts
import { Router } from 'express';
import { ReagentController } from './controllers/ReagentController';

const router = Router();

router.get('/', (req, res) => {
  res.send('API do SIRU está online e modularizada! 🚀');
});

router.get('/reagents', ReagentController.index);
router.post('/reagents', ReagentController.create);
router.delete('/reagents/:id', ReagentController.delete);

export { router };