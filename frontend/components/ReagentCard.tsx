
import React from 'react';
import { type Reagent, ReagentCategory, type User } from '../types';

interface ReagentCardProps {
  reagent: Reagent;
  onDelete: (id: string) => void;
  user: User;
  onOpenWithdrawalModal: (reagent: Reagent) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const getCategoryTagStyle = (category: ReagentCategory) => {
    switch (category) {
        case ReagentCategory.ACID: return 'bg-red-100 text-red-800';
        case ReagentCategory.BASE: return 'bg-blue-100 text-blue-800';
        case ReagentCategory.SOLVENT: return 'bg-green-100 text-green-800';
        case ReagentCategory.SALT: return 'bg-purple-100 text-purple-800';
        case ReagentCategory.OXIDIZER: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const getStockStatus = (reagent: Reagent) => {
    if (reagent.quantity === 0) {
        return { text: 'Esgotado', style: 'bg-gray-200 text-gray-800' };
    }
    if (reagent.quantity <= reagent.minStockLevel) {
        return { text: 'Baixo', style: 'bg-yellow-200 text-yellow-800' };
    }
    return { text: 'OK', style: 'bg-green-200 text-green-800' };
}

const ReagentTableRow: React.FC<ReagentCardProps> = ({ reagent, onDelete, user, onOpenWithdrawalModal }) => {
  const isExpired = new Date(reagent.expiryDate) < new Date();
  const stockStatus = getStockStatus(reagent);

  return (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {reagent.name}
                    {reagent.isControlled && <i className="fa-solid fa-shield-halved text-tech-500" title="Substância Controlada"></i>}
                </div>
            </div>
             <div className="text-sm text-gray-500">{reagent.casNumber}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryTagStyle(reagent.category)}`}>
                {reagent.category}
            </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{reagent.quantity} {reagent.unit}</div>
            <div className="text-sm text-gray-500">Mín: {reagent.minStockLevel} {reagent.unit}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.style}`}>
                {stockStatus.text}
            </span>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
            {new Date(reagent.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            {isExpired && " (Expirado)"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
             <div className="flex items-center justify-end space-x-4">
                <button 
                    onClick={() => onOpenWithdrawalModal(reagent)}
                    title="Solicitar Retirada"
                    className="text-secondary-600 hover:text-secondary-500 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm"
                    disabled={reagent.quantity === 0}
                >
                   <i className="fa-solid fa-dolly"></i> Solicitar
                </button>
                {user.role === 'ADMIN' && (
                     <button 
                        onClick={() => onDelete(reagent.id)}
                        title="Excluir Reagente"
                        className="text-accent-600 hover:text-accent-500">
                        <TrashIcon/>
                    </button>
                )}
            </div>
        </td>
    </tr>
  );
}

export default ReagentTableRow;
