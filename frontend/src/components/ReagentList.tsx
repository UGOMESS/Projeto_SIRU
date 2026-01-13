// frontend/src/components/ReagentList.tsx

import React from 'react';
import { Reagent, User } from '../types';

interface ReagentListProps {
  reagents: Reagent[];
  onDelete: (id: string) => void;
  user: User;
  onOpenWithdrawalModal: (reagent: Reagent) => void; // Solicitar
  onEdit: (reagent: Reagent) => void; // Editar
  onViewDetails: (reagent: Reagent) => void; // NOVO: Ver Detalhes
}

export default function ReagentList({ 
  reagents, 
  onDelete, 
  user, 
  onOpenWithdrawalModal,
  onEdit,
  onViewDetails
}: ReagentListProps) {
  
  if (reagents.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white border border-dashed border-gray-300 rounded-xl mt-4">
        <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-flask text-2xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Nenhum reagente encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">Tente ajustar sua busca ou adicione um novo reagente ao estoque.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
      <table className="min-w-full divide-y divide-gray-200 text-left">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
          <tr>
            <th scope="col" className="px-6 py-4">Reagente / CAS</th>
            <th scope="col" className="px-6 py-4">Fórmula</th>
            <th scope="col" className="px-6 py-4">Categoria</th>
            <th scope="col" className="px-6 py-4">Localização</th>
            <th scope="col" className="px-6 py-4">Estoque</th>
            <th scope="col" className="px-6 py-4 text-center">Status</th>
            <th scope="col" className="px-6 py-4">Validade</th>
            <th scope="col" className="px-6 py-4 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reagents.map(reagent => {
             // Lógica de Status Visual
             const isExpired = new Date(reagent.expirationDate) < new Date();
             const isLowStock = reagent.quantity <= reagent.minQuantity;

             return (
                <tr 
                    key={reagent.id} 
                    onClick={() => onViewDetails(reagent)} // CLIQUE NA LINHA ABRE DETALHES
                    className="hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                    {/* 1. Nome e CAS */}
                    <td className="px-6 py-4 align-middle">
                        <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{reagent.name}</div>
                        {reagent.casNumber && (
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1 border border-gray-200">
                                CAS: {reagent.casNumber}
                            </div>
                        )}
                    </td>

                    {/* 2. Fórmula */}
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono align-middle">
                        {reagent.formula || '-'}
                    </td>

                    {/* 3. Categoria */}
                    <td className="px-6 py-4 text-sm text-gray-600 align-middle">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs border border-gray-200">
                            {reagent.category}
                        </span>
                    </td>

                    {/* 4. Localização */}
                    <td className="px-6 py-4 text-sm text-gray-600 align-middle">
                        <div className="flex items-center gap-1">
                            <i className="fa-solid fa-location-dot text-gray-400"></i>
                            {reagent.location || 'N/A'}
                        </div>
                    </td>

                    {/* 5. Estoque */}
                    <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold text-base ${isLowStock ? 'text-orange-600' : 'text-green-700'}`}>
                                {reagent.quantity} <span className="text-xs font-normal text-gray-500">{reagent.unit}</span>
                            </span>
                        </div>
                    </td>

                    {/* 6. Status (Alertas) */}
                    <td className="px-6 py-4 text-center align-middle">
                        <div className="flex flex-col gap-1 items-center">
                            {isExpired && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                    VENCIDO
                                </span>
                            )}
                            {isLowStock && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                    BAIXO
                                </span>
                            )}
                            {reagent.isControlled && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                    CONTROLADO
                                </span>
                            )}
                            {!isExpired && !isLowStock && !reagent.isControlled && (
                                <span className="text-green-500"><i className="fa-solid fa-circle-check"></i></span>
                            )}
                        </div>
                    </td>

                    {/* 7. Validade */}
                    <td className="px-6 py-4 text-sm align-middle">
                        <span className={`${isExpired ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            {new Date(reagent.expirationDate).toLocaleDateString('pt-BR')}
                        </span>
                    </td>

                    {/* 8. Ações */}
                    <td className="px-6 py-4 text-center align-middle">
                        <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Botão Solicitar */}
                            <button 
                                onClick={() => onOpenWithdrawalModal(reagent)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all shadow-sm border border-blue-100"
                                title="Solicitar Retirada"
                            >
                                <i className="fa-solid fa-hand-holding-droplet"></i>
                            </button>
                            
                            {/* Ações de Admin */}
                            {user.role === 'ADMIN' && (
                                <>
                                    <button 
                                        onClick={() => onEdit(reagent)}
                                        className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white p-2 rounded-lg transition-all shadow-sm border border-orange-100"
                                        title="Editar"
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(reagent.id)}
                                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all shadow-sm border border-red-100"
                                        title="Excluir"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </>
                            )}
                        </div>
                    </td>
                </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
}