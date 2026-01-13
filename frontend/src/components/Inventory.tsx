// frontend/src/components/Inventory.tsx

import React, { useState } from 'react';
import { Reagent, User, WithdrawalRequest, RequestStatus } from '../types';
import { toast } from 'react-toastify';

// Importando os componentes modulares
// Certifique-se de que todos esses arquivos existem na pasta components
import ReagentList from './ReagentList';
import { AddReagentModal } from './AddReagentModal';
import { RequestWithdrawalModal } from './RequestWithdrawalModal';
import { ReagentDetailsModal } from './ReagentDetailsModal';

interface InventoryProps {
  reagents: Reagent[];
  user: User;
  onAddReagent: (reagent: Reagent) => void;
  onDeleteReagent: (id: string) => void;
  onUpdateReagent: (reagent: Reagent) => void;
  onRequestWithdrawal: (request: WithdrawalRequest) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  reagents, 
  user, 
  onAddReagent, 
  onDeleteReagent, 
  onUpdateReagent,
  onRequestWithdrawal 
}) => {
  // --- Estados de Controle ---
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle dos Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReagent, setEditingReagent] = useState<Reagent | undefined>(undefined);
  
  const [selectedReagentForDetails, setSelectedReagentForDetails] = useState<Reagent | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedReagentForWithdrawal, setSelectedReagentForWithdrawal] = useState<Reagent | null>(null);

  // --- Lógica de Filtro ---
  const filteredReagents = reagents.filter(reagent => {
    const term = searchTerm.toLowerCase().trim();
    return (
      reagent.name.toLowerCase().includes(term) ||
      (reagent.casNumber && reagent.casNumber.includes(term)) ||
      (reagent.brand && reagent.brand.toLowerCase().includes(term))
    );
  });

  // --- Handlers (Ações) ---

  // 1. Abrir Modal de Criação
  const handleOpenCreate = () => {
    setEditingReagent(undefined); // Garante que não é edição
    setIsAddModalOpen(true);
  };

  // 2. Abrir Modal de Edição
  const handleOpenEdit = (reagent: Reagent) => {
    setEditingReagent(reagent);
    setIsAddModalOpen(true);
  };

  // 3. Salvar (Criar ou Editar)
  const handleSaveReagent = (data: any) => {
    try {
      if (editingReagent) {
        onUpdateReagent(data); // O ID já vem dentro do data no componente AddReagentModal
        toast.success('Reagente atualizado com sucesso!');
      } else {
        onAddReagent(data);
        toast.success('Reagente cadastrado com sucesso!');
      }
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar reagente.');
    }
  };

  // 4. Abrir Detalhes
  const handleViewDetails = (reagent: Reagent) => {
    setSelectedReagentForDetails(reagent);
    setIsDetailsModalOpen(true);
  };

  // 5. Processar Retirada
  const handleWithdrawalSubmit = (data: { amount: number; reason: string; usageDate: string; requestedBy: string }) => {
    if (!selectedReagentForWithdrawal) return;

    const newRequest: WithdrawalRequest = {
        id: '', // Será gerado pelo backend
        reagentId: selectedReagentForWithdrawal.id,
        reagentName: selectedReagentForWithdrawal.name,
        amount: data.amount,
        unit: selectedReagentForWithdrawal.unit,
        requestedBy: data.requestedBy,
        requestedAt: new Date().toISOString(),
        status: RequestStatus.PENDING,
        reason: data.reason,
        usageDate: data.usageDate
    };

    onRequestWithdrawal(newRequest);
    setSelectedReagentForWithdrawal(null);
    toast.success('Solicitação enviada com sucesso!');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <i className="fa-solid fa-flask text-blue-600"></i> Inventário
           </h2>
           <p className="text-sm text-gray-500">Gerencie o estoque, visualize validades e faça solicitações.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Buscar (Nome, CAS)..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {user.role === 'ADMIN' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold whitespace-nowrap"
            >
              <i className="fa-solid fa-plus"></i>
              <span className="hidden sm:inline">Novo Reagente</span>
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE REAGENTES (Componente Modular) */}
      <ReagentList 
        reagents={filteredReagents}
        user={user}
        onDelete={onDeleteReagent}
        onEdit={handleOpenEdit}              // Passa função de editar
        onViewDetails={handleViewDetails}    // Passa função de detalhes (clique na linha)
        onOpenWithdrawalModal={setSelectedReagentForWithdrawal} // Passa função de solicitar
      />

      {/* --- MODAIS --- */}

      {/* 1. Criar / Editar */}
      <AddReagentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleSaveReagent}
        initialData={editingReagent} // Se tiver dados, entra em modo edição
        isEditing={!!editingReagent}
      />

      {/* 2. Detalhes (Visualização Completa) */}
      <ReagentDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        reagent={selectedReagentForDetails}
      />

      {/* 3. Solicitar Retirada */}
      <RequestWithdrawalModal 
        reagent={selectedReagentForWithdrawal}
        user={user}
        onClose={() => setSelectedReagentForWithdrawal(null)}
        onSubmit={handleWithdrawalSubmit}
      />

    </div>
  );
};