
export enum ReagentCategory {
  ACID = 'Ácido',
  BASE = 'Base',
  SOLVENT = 'Solvente',
  SALT = 'Sal',
  OXIDIZER = 'Oxidante'
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
  // FIX: Add `formula` property to the Reagent type to match its usage in components like ReagentCard and AddReagentModal.
  formula: string;
  casNumber: string;
  category: ReagentCategory;
  quantity: number;
  unit: Unit;
  expiryDate: string;
  location: string;
  isControlled: boolean;
  minStockLevel: number;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  reagentId: string;
  reagentName: string;
  amount: number;
  unit: Unit;
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
  unit: Unit;
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