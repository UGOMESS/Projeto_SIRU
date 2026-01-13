import React, { useState } from 'react';
import { Reagent, User, WithdrawalRequest, RequestStatus } from '../types';
import { toast } from 'react-toastify'; // Mantido apenas para erros locais de validação se houver

import ReagentList from './ReagentList';
import { AddReagentModal } from './AddReagentModal';
import { RequestWithdrawalModal } from './RequestWithdrawalModal';
import { ReagentDetailsModal } from './ReagentDetailsModal';

interface InventoryProps {
  reagents: Reagent[];
  user: User;
  onAddReagent: (reagent: any) => Promise<void>;
  onDeleteReagent: (id: string) => Promise<void>;
  onUpdateReagent: (reagent: any) => Promise<void>;
  onRequestWithdrawal: (request: any) => Promise<void>;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  reagents, 
  user, 
  onAddReagent, 
  onDeleteReagent, 
  onUpdateReagent,
  onRequestWithdrawal 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle dos Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReagent, setEditingReagent] = useState<Reagent | undefined>(undefined);
  
  const [selectedReagentForDetails, setSelectedReagentForDetails] = useState<Reagent | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedReagentForWithdrawal, setSelectedReagentForWithdrawal] = useState<Reagent | null>(null);

  // Filtro
  const filteredReagents = reagents.filter(reagent => {
    const term = searchTerm.toLowerCase().trim();
    return (
      reagent.name.toLowerCase().includes(term) ||
      (reagent.casNumber && reagent.casNumber.includes(term)) ||
      (reagent.brand && reagent.brand.toLowerCase().includes(term))
    );
  });

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingReagent(undefined);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (reagent: Reagent) => {
    setEditingReagent(reagent);
    setIsAddModalOpen(true);
  };

  const handleSaveReagent = async (data: any) => {
    // CORREÇÃO: Removemos toast.success daqui pois o App.tsx já exibe
    try {
      if (editingReagent) {
        await onUpdateReagent({ ...data, id: editingReagent.id });
      } else {
        await onAddReagent(data);
      }
      setIsAddModalOpen(false);
    } catch (error) {
      // Erro mantemos aqui caso o pai não capture
      console.error(error);
    }
  };

  const handleViewDetails = (reagent: Reagent) => {
    setSelectedReagentForDetails(reagent);
    setIsDetailsModalOpen(true);
  };

  const handleWithdrawalSubmit = async (data: { amount: number; reason: string; usageDate: string }) => {
    if (!selectedReagentForWithdrawal) return;

    // CORREÇÃO: Removemos toast.success daqui
    const newRequest = {
        reagentId: selectedReagentForWithdrawal.id,
        amount: data.amount,
        reason: data.reason,
        usageDate: data.usageDate
    };

    await onRequestWithdrawal(newRequest);
    setSelectedReagentForWithdrawal(null);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <i className="fa-solid fa-flask text-blue-600"></i> Inventário
           </h2>
           <p className="text-sm text-gray-500">Gerencie o estoque e visualize validades.</p>
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

      {/* LISTA DE REAGENTES */}
      <ReagentList 
        reagents={filteredReagents}
        user={user}
        onDelete={onDeleteReagent}
        onEdit={handleOpenEdit}
        onViewDetails={handleViewDetails}
        onOpenWithdrawalModal={setSelectedReagentForWithdrawal}
      />

      {/* --- MODAIS --- */}
      <AddReagentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleSaveReagent}
        initialData={editingReagent}
        isEditing={!!editingReagent}
      />

      <ReagentDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        reagent={selectedReagentForDetails}
      />

      <RequestWithdrawalModal 
        reagent={selectedReagentForWithdrawal}
        user={user}
        onClose={() => setSelectedReagentForWithdrawal(null)}
        onSubmit={handleWithdrawalSubmit}
      />

    </div>
  );
};