// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { router } from './routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(router); // Usa as rotas novas

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});