// frontend/src/services/api.ts
import axios from 'axios';

// Cria a conexão com o backend rodando na porta 3000
const api = axios.create({
  baseURL: 'http://localhost:3000', 
});

// Função para buscar os reagentes do banco
export const getReagents = async () => {
  try {
    const response = await api.get('/reagents');
    return response.data;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    return []; // Retorna lista vazia para não travar a tela
  }
};

// Função para criar um novo reagente
export const createReagent = async (reagentData: any) => {
  try {
    const response = await api.post('/reagents', reagentData);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar reagente:", error);
    throw error;
  }
};

export default api;