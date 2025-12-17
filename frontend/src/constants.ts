// frontend/src/constants.ts

// 1. CORREÇÃO DE IMPORT: Removemos o "/src" pois já estamos nele
import { Reagent, WithdrawalRequest, WasteLog, ReagentCategory, Unit, RequestStatus, UniversityNews } from './types';

export const MOCK_REAGENTS: Reagent[] = [
  {
    id: 'r1',
    name: 'Ácido Clorídrico',
    formula: 'HCl',
    casNumber: '7647-01-0',
    category: ReagentCategory.ACID,
    quantity: 500,
    unit: Unit.ML,
    // 2. CORREÇÃO: Mudado de expiryDate para expirationDate
    expirationDate: '2025-12-31', 
    location: 'Armário A1',
    isControlled: false,
    minStockLevel: 100,
    createdAt: new Date('2023-01-10T10:00:00Z').toISOString(),
  },
  {
    id: 'r2',
    name: 'Hidróxido de Sódio',
    formula: 'NaOH',
    casNumber: '1310-73-2',
    category: ReagentCategory.BASE,
    quantity: 200,
    unit: Unit.G,
    expirationDate: '2026-06-30', // Correção aqui
    location: 'Armário B2',
    isControlled: false,
    minStockLevel: 250,
    createdAt: new Date('2023-02-15T11:30:00Z').toISOString(),
  },
  {
    id: 'r3',
    name: 'Etanol Absoluto',
    formula: 'C2H5OH',
    casNumber: '64-17-5',
    category: ReagentCategory.SOLVENT,
    quantity: 2.5,
    unit: Unit.L,
    expirationDate: '2024-01-15', // Correção aqui (Vencido)
    location: 'Prateleira C3',
    isControlled: true,
    minStockLevel: 1,
    createdAt: new Date('2023-03-20T09:00:00Z').toISOString(),
  },
   {
    id: 'r4',
    name: 'Nitrato de Prata',
    formula: 'AgNO3',
    casNumber: '7761-88-8',
    category: ReagentCategory.SALT,
    quantity: 100,
    unit: Unit.G,
    expirationDate: '2027-08-10', // Correção aqui
    location: 'Armário de Controlados',
    isControlled: true,
    minStockLevel: 20,
    createdAt: new Date('2023-04-05T14:00:00Z').toISOString(),
  },
  {
    id: 'r5',
    name: 'Permanganato de Potássio',
    formula: 'KMnO4',
    casNumber: '7722-64-7',
    category: ReagentCategory.OXIDIZER,
    quantity: 0,
    unit: Unit.KG,
    expirationDate: '2025-05-20', // Correção aqui
    location: 'Prateleira D1',
    isControlled: false,
    minStockLevel: 0.1,
    createdAt: new Date('2023-05-12T16:45:00Z').toISOString(),
  },
];

export const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'w1',
    reagentId: 'r1', 
    reagentName: 'Ácido Clorídrico', 
    amount: 50, 
    unit: Unit.ML,
    requestedBy: 'Pesquisador Silva',
    requestedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: RequestStatus.PENDING,
    reason: 'Titulação de amostra X.',
  },
  {
    id: 'w2',
    reagentId: 'r2', 
    reagentName: 'Hidróxido de Sódio', 
    amount: 100, 
    unit: Unit.G,
    requestedBy: 'Pesquisadora Costa',
    requestedAt: new Date(Date.now() - 172800000).toISOString(), // Two days ago
    status: RequestStatus.APPROVED,
    reason: 'Preparação de solução 1M.',
  },
  {
    id: 'w3',
    reagentId: 'r4', 
    reagentName: 'Nitrato de Prata', 
    amount: 10, 
    unit: Unit.G,
    requestedBy: 'Pesquisador Silva',
    requestedAt: new Date(Date.now() - 259200000).toISOString(), // Three days ago
    status: RequestStatus.REJECTED,
    reason: 'Análise de cloretos.',
  },
];

export const MOCK_WASTE_LOGS: WasteLog[] = [
  {
    id: 'wl1',
    reagentName: 'Resíduo de Acetona',
    amount: 200,
    unit: Unit.ML,
    disposalDate: new Date().toISOString(),
    disposedBy: 'Admin Principal',
    classification: 'Solvente Orgânico Não Halogenado',
  },
];


export const MOCK_NEWS: UniversityNews[] = [
    {
        id: 'n1',
        title: 'Edital Pibic 2024/2025 com inscrições abertas',
        date: '2 dias atrás',
        category: 'Edital',
        link: 'https://proppi.unilab.edu.br/pibic-2024-2025/'
    },
    {
        id: 'n2',
        title: 'Semana da Química: Palestras e Workshops',
        date: '5 dias atrás',
        category: 'Evento',
        link: 'https://unilab.edu.br/icen/'
    },
    {
        id: 'n3',
        title: 'Aviso: Manutenção do sistema SIGAA no próximo fim de semana',
        date: '1 semana atrás',
        category: 'Aviso',
        link: 'https://unilab.edu.br/noticias/'
    }
];