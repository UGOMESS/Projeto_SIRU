// frontend/src/types.ts

export enum ReagentCategory {
  ACID = 'Ácido',
  BASE = 'Base',
  SOLVENT = 'Solvente',
  SALT = 'Sal',
  OXIDIZER = 'Oxidante',
  // Adicionando um fallback caso precise
  REAGENT = 'Reagente' 
}

export enum Unit {
  ML = 'mL',
  L = 'L',
  G = 'g',
  KG = 'kg'
}

export enum RequestStatus {
  PENDING = 'Pendente',
  APPROVED = 'Aprovado',
  REJECTED = 'Recusado'
}

export interface Reagent {
  id: string;
  name: string;
  
  // --- CAMPOS NOVOS ---
  formula?: string;
  casNumber?: string;
  location?: string;
  
  // Adicione a descrição aqui:
  description?: string; 

  category: ReagentCategory | string; 
  quantity: number;
  unit: string; 
  
  // --- CORREÇÃO DA DATA ---
  expirationDate: string; 
  expiryDate?: string;

  isControlled: boolean;
  minStockLevel: number;
  
  // Adicione minQuantity para evitar erro se o banco mandar esse nome
  minQuantity?: number; 

  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  reagentId: string;
  reagentName: string;
  amount: number;
  unit: string;
  requestedBy: string;
  requestedAt: string;
  status: RequestStatus;
  reason?: string;
  usageDate?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'RESEARCHER';
  email: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface UniversityNews {
  id: string;
  title: string;
  date: string;
  category: 'Edital' | 'Evento' | 'Aviso' | 'Institucional';
  link: string;
}

// --- NOVAS INTERFACES PARA GESTÃO DE RESÍDUOS ---

export interface WasteContainer {
  id: string;
  identifier: string; // Ex: "B-01"
  type: string;       // Ex: "Ácidos"
  capacity: number;   // Capacidade total em Litros
  currentVolume: number; // Volume ocupado
  location: string;
  isActive: boolean;
}

export interface WasteLog {
  id: string;
  description: string;
  quantity: number;
  date: string;
  userId: string;
  containerId: string;
  user?: {
    name: string;
  };
  container?: WasteContainer;
}

// Interface específica para gerar o relatório PDF/CSV
export interface WasteRecord {
  id: string;
  date: string;
  reagentName: string;
  amount: number;
  unit: string;
  registeredBy: string;
  destination?: string;
}