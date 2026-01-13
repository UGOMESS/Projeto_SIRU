// frontend/src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESEARCHER';
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED' // Adicionado para garantir compatibilidade com o fluxo completo
}

export interface Reagent {
  id: string;
  name: string;
  casNumber?: string;
  brand?: string; // Adicionei brand como opcional pois estava nos componentes anteriores
  category: string;
  description?: string;
  formula?: string;
  quantity: number;
  unit: string;
  minQuantity: number; // Agora oficial (antes era minStockLevel)
  minStockLevel?: number; // Opcional: Mantido temporariamente para não quebrar componentes antigos que usam esse nome
  location?: string;
  expirationDate: string;
  isControlled: boolean;
  createdAt: string;
}

export interface RequestItem {
  id: string;
  quantity: number;
  reagent: Reagent;
}

export interface WithdrawalRequest {
  id: string;
  status: RequestStatus | string; // Aceita string para evitar erros de tipagem flexível
  reason?: string;
  usageDate?: string;
  requestedAt?: string; // Data de criação
  createdAt?: string;   // Compatibilidade
  requestedBy?: string; // Nome do usuário (para exibição)
  user?: User;          // Objeto usuário completo (se vier da API)
  items?: RequestItem[];
  
  // Campos auxiliares para o Frontend (Flattened data)
  reagentId?: string;
  reagentName?: string;
  amount?: number;
  unit?: string;
}

// --- GESTÃO DE RESÍDUOS (WASTE MANAGEMENT) ---

export interface WasteContainer {
  id: string;
  identifier: string; // Ex: "B-01"
  type: string;       // Ex: "Solventes"
  capacity: number;
  currentVolume: number;
  location: string;
  isActive: boolean;
}

export interface WasteLog {
  id: string;
  description: string;
  quantity: number;
  date: string;
  user: { name: string };           
  container: { identifier: string; type: string };
}