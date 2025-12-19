// frontend/src/services/api.ts
import axios from 'axios';

// Cria a conexão com o backend
export const api = axios.create({
  baseURL: 'http://localhost:3000', 
});

// Buscar todos
export const getReagents = async () => {
  try {
    const response = await api.get('/reagents');
    return response.data;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    return [];
  }
};

// Criar novo
export const createReagent = async (reagentData: any) => {
  try {
    const response = await api.post('/reagents', reagentData);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar reagente:", error);
    throw error;
  }
};

// --- NOVA FUNÇÃO: ATUALIZAR ---
export const updateReagent = async (id: string, reagentData: any) => {
  try {
    // Removemos o ID do corpo dos dados para não dar conflito (o ID vai na URL)
    const { id: _, ...data } = reagentData;
    
    const response = await api.put(`/reagents/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar reagente:", error);
    throw error;
  }
};

export default api;