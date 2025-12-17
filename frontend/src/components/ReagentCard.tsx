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
  if (reagent.quantity <= (reagent.minStockLevel || 10)) {
    return { text: 'Baixo', style: 'bg-yellow-200 text-yellow-800' };
  }
  return { text: 'OK', style: 'bg-green-200 text-green-800' };
}

// Função para formatar a data visualmente
const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data Inválida';
    // UTC garante consistência visual (evita recuar 1 dia por fuso horário)
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const ReagentTableRow: React.FC<ReagentCardProps> = ({ reagent, onDelete, user, onOpenWithdrawalModal }) => {
  // 1. Resolve qual campo de data usar (backend novo vs mock antigo)
  const dateValue = reagent.expirationDate || (reagent as any).expiryDate;
  
  // 2. Lógica de "Vencido" corrigida (Ignora horas/minutos)
  const isExpired = (() => {
      if (!dateValue) return false;
      const validDate = new Date(dateValue);
      if (isNaN(validDate.getTime())) return false;

      const today = new Date();
      // Zera as horas para comparar apenas o calendário
      today.setHours(0, 0, 0, 0);
      
      // Cria uma cópia da data de validade e zera as horas também
      const compareDate = new Date(validDate);
      // Ajuste importante: Se a string for UTC (ex: T00:00:00Z), o new Date converte para local.
      // Aqui garantimos a comparação simples de timestamp
      compareDate.setHours(0, 0, 0, 0);

      // Só é vencido se a data for estritamente anterior a hoje (ontem ou antes)
      return compareDate.getTime() < today.getTime();
  })();
  
  const stockStatus = getStockStatus(reagent);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* 1. Nome e CAS */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
           <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {reagent.name}
              {reagent.isControlled && <i className="fa-solid fa-shield-halved text-red-500" title="Substância Controlada"></i>}
           </div>
           <div className="text-xs text-gray-500">CAS: {reagent.casNumber || '-'}</div>
        </div>
      </td>

      {/* 2. Fórmula (Campo Novo) */}
      <td className="px-6 py-4 whitespace-nowrap">
         <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
             {reagent.formula || '-'}
         </div>
      </td>

      {/* 3. Categoria */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryTagStyle(reagent.category)}`}>
          {reagent.category}
        </span>
      </td>

      {/* 4. Localização (Campo Novo) */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
         {reagent.location || '-'}
      </td>

      {/* 5. Estoque */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-semibold">{reagent.quantity} {reagent.unit}</div>
        <div className="text-xs text-gray-400">Mín: {reagent.minStockLevel || 10} {reagent.unit}</div>
      </td>

      {/* 6. Status */}
      <td className="px-6 py-4 whitespace-nowrap">
         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.style}`}>
            {stockStatus.text}
         </span>
      </td>

      {/* 7. Validade */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
         {formatDate(dateValue)}
         {isExpired && (
             <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">Vencido</span>
         )}
      </td>

      {/* 8. Ações */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
         <div className="flex items-center justify-end space-x-4">
            <button 
              onClick={() => onOpenWithdrawalModal(reagent)}
              title="Solicitar Retirada"
              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm flex items-center gap-1"
              disabled={reagent.quantity === 0}
            >
               <span>Retirar</span>
            </button>
            {user.role === 'ADMIN' && (
               <button 
                 onClick={() => onDelete(reagent.id)}
                 title="Excluir Reagente"
                 className="text-red-600 hover:text-red-800 transition-colors">
                 <TrashIcon/>
               </button>
            )}
         </div>
      </td>
    </tr>
  );
}

export default ReagentTableRow;