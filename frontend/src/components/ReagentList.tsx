// frontend/src/components/ReagentList.tsx
import React from 'react';
import { type Reagent, type User } from '../types'; // Ajustei o caminho para ../types (padrão do projeto)
import ReagentCard from './ReagentCard';

interface ReagentListProps {
  reagents: Reagent[];
  onDelete: (id: string) => void;
  user: User;
  onOpenWithdrawalModal: (reagent: Reagent) => void;
  // 1. Recebendo a função de editar
  onEdit: (reagent: Reagent) => void; 
}

export default function ReagentList({ 
  reagents, 
  onDelete, 
  user, 
  onOpenWithdrawalModal,
  onEdit // <--- Destruturando
}: ReagentListProps) {
  
  if (reagents.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum reagente encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">Tente ajustar sua busca ou adicione um novo reagente.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reagente</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fórmula</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reagents.map(reagent => (
            <ReagentCard 
              key={reagent.id} 
              reagent={reagent} 
              onDelete={onDelete} 
              user={user} 
              onOpenWithdrawalModal={onOpenWithdrawalModal}
              onEdit={onEdit} // 2. Passando para o Card final
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}