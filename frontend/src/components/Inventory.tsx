// frontend/src/components/Inventory.tsx

import React, { useState } from 'react';
import { Reagent, User, ReagentCategory, WithdrawalRequest } from '../types';
import ReagentTableRow from './ReagentCard'; 
import AddReagentModal from './AddReagentModal';
import { RequestWithdrawalModal } from './RequestWithdrawalModal'; 

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Estado para controlar qual reagente está sendo editado (null = criando novo)
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null);

  // Estado para Modal de Retirada
  const [withdrawalReagent, setWithdrawalReagent] = useState<Reagent | null>(null);

  // --- Lógica de Filtro ---
  const filteredReagents = reagents.filter(reagent => {
    const matchesSearch = reagent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (reagent.casNumber && reagent.casNumber.includes(searchTerm)) ||
                          (reagent.formula && reagent.formula.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || reagent.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // --- Handlers ---
  
  // Abrir modal para CRIAR
  const openCreateModal = () => {
    setEditingReagent(null); 
    setIsAddModalOpen(true);
  };

  // Abrir modal para EDITAR
  const openEditModal = (reagent: Reagent) => {
    setEditingReagent(reagent);
    setIsAddModalOpen(true);
  };

  // Salvar (pode ser criar ou atualizar)
  const handleSaveReagent = (reagentData: any) => {
    // Se o modal retornar apenas os dados do form, precisamos mesclar com o ID se for edição
    const finalData = editingReagent 
      ? { ...editingReagent, ...reagentData } 
      : reagentData;

    if (editingReagent) {
      onUpdateReagent(finalData);
    } else {
      onAddReagent(finalData);
    }
    setIsAddModalOpen(false);
    setEditingReagent(null);
  };

  // Handler para Retirada
  const handleSubmitWithdrawal = (data: { amount: number; reason: string; usageDate: string; requestedBy: string; }) => {
     if (!withdrawalReagent) return;

     // Monta o objeto completo de WithdrawalRequest
     const newRequest: WithdrawalRequest = {
         id: `w${Date.now()}`,
         reagentId: withdrawalReagent.id,
         reagentName: withdrawalReagent.name,
         amount: Number(data.amount),
         unit: withdrawalReagent.unit,
         requestedAt: new Date().toISOString(),
         status: 'PENDING' as any,
         reason: data.reason,
         usageDate: data.usageDate,
         requestedBy: data.requestedBy,
     };
     
     onRequestWithdrawal(newRequest);
     setWithdrawalReagent(null);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ferramentas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        
        {/* Busca e Filtro */}
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-search"></i>
            </span>
            <input
              type="text"
              placeholder="Buscar por nome, CAS ou fórmula..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-unilab-blue focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unilab-blue outline-none bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="Todos">Todas Categorias</option>
            {Object.values(ReagentCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* 🔒 Botão Adicionar - PROTEGIDO (Só Admin vê) */}
        {user.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-unilab-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium whitespace-nowrap"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Adicionar Reagente</span>
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reagente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fórmula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReagents.length > 0 ? (
                filteredReagents.map((reagent) => (
                  <ReagentTableRow 
                    key={reagent.id} 
                    reagent={reagent} 
                    onDelete={onDeleteReagent}
                    user={user} 
                    onOpenWithdrawalModal={setWithdrawalReagent}
                    onEdit={openEditModal} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <i className="fa-solid fa-flask text-4xl text-gray-300"></i>
                      <p>Nenhum reagente encontrado com os filtros atuais.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Híbrido (Adicionar / Editar) */}
      {isAddModalOpen && (
        <AddReagentModal
          // Removido: isOpen={isAddModalOpen} (não existe na interface)
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingReagent(null);
          }}
          onAdd={handleSaveReagent} 
          
          // Se o AddReagentModal não aceitar essas props, ele vai ignorar (no JS) ou dar erro (no TS).
          // Se der erro de tipo, significa que precisamos atualizar o AddReagentModal também.
          initialData={editingReagent} 
          isEditing={!!editingReagent}
        />
      )}

      {/* Modal de Retirada */}
      {withdrawalReagent && (
        <RequestWithdrawalModal
          reagent={withdrawalReagent}
          user={user}
          onClose={() => setWithdrawalReagent(null)}
          onSubmit={handleSubmitWithdrawal}
        />
      )}
    </div>
  );
};