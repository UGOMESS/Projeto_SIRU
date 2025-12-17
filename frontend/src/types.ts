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
  
  // --- CAMPOS NOVOS (Marcados como opcionais '?' para evitar crash com dados antigos) ---
  formula?: string;
  casNumber?: string;
  location?: string;
  
  category: ReagentCategory | string; // Aceita string caso venha algo diferente do banco
  quantity: number;
  unit: string; // Mudamos para string para aceitar 'ML' ou 'mL' sem dar erro
  
  // --- CORREÇÃO DA DATA ---
  // O backend envia expirationDate. Mantemos expiryDate opcional por compatibilidade.
  expirationDate: string; 
  expiryDate?: string;

  isControlled: boolean;
  minStockLevel: number;
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

export interface WasteLog {
  id: string;
  reagentName: string;
  amount: number;
  unit: string;
  disposalDate: string;
  disposedBy: string;
  classification: string;
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