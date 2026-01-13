// frontend/src/components/ReagentDetailsModal.tsx

import React from 'react';
import { Reagent } from '../types';

interface ReagentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reagent: Reagent | null;
}

export const ReagentDetailsModal: React.FC<ReagentDetailsModalProps> = ({ isOpen, onClose, reagent }) => {
  // Se não estiver aberto ou não tiver reagente selecionado, não renderiza nada
  if (!isOpen || !reagent) return null;

  const isExpired = new Date(reagent.expirationDate) < new Date();
  const isLowStock = reagent.quantity <= (reagent.minQuantity || reagent.minStockLevel || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative transform transition-all scale-100">
        
        {/* Botão Fechar Flutuante */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 transition-colors"
        >
            <i className="fa-solid fa-times text-2xl shadow-sm"></i>
        </button>

        {/* Header Visual com Gradiente */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
            {/* Ícone de fundo decorativo */}
            <i className="fa-solid fa-flask absolute -bottom-4 -right-4 text-8xl text-white/10 rotate-12"></i>
            
            <h2 className="text-2xl font-bold mb-2 relative z-10">{reagent.name}</h2>
            
            <div className="flex flex-wrap gap-2 text-sm relative z-10">
                {reagent.casNumber && (
                    <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                        CAS: {reagent.casNumber}
                    </span>
                )}
                {reagent.brand && (
                    <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                        <i className="fa-regular fa-copyright mr-1"></i> {reagent.brand}
                    </span>
                )}
                 <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                    {reagent.category}
                </span>
            </div>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Cards de Status (Estoque e Validade) */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isLowStock ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                    <p className={`text-xs uppercase font-bold mb-1 ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                        Estoque Atual
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${isLowStock ? 'text-orange-800' : 'text-green-800'}`}>
                            {reagent.quantity}
                        </span>
                        <span className="text-sm font-medium text-gray-500">{reagent.unit}</span>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border ${isExpired ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <p className={`text-xs uppercase font-bold mb-1 ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                        Validade
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${isExpired ? 'text-red-800' : 'text-gray-800'}`}>
                            {new Date(reagent.expirationDate).toLocaleDateString('pt-BR')}
                        </span>
                        {isExpired && <i className="fa-solid fa-triangle-exclamation text-red-500 animate-pulse"></i>}
                    </div>
                </div>
            </div>

            {/* Informações Técnicas */}
            <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {reagent.formula && (
                    <div className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500">Fórmula Química</span>
                        <span className="font-mono font-bold bg-white px-2 rounded border border-gray-200">{reagent.formula}</span>
                    </div>
                )}
                <div className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500">Localização</span>
                    <span className="font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-blue-400"></i> {reagent.location || 'Não definida'}
                    </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500">Estoque Mínimo</span>
                    <span className="font-medium text-gray-800">{reagent.minQuantity || reagent.minStockLevel} {reagent.unit}</span>
                </div>
                {reagent.isControlled && (
                    <div className="pt-2 text-center">
                         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <i className="fa-solid fa-shield-halved"></i> Substância Controlada
                        </span>
                    </div>
                )}
            </div>

            {/* DESCRIÇÃO DO REAGENTE */}
            <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-blue-500"></i> Descrição / Observações
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-600 text-sm leading-relaxed min-h-[80px] shadow-sm italic">
                    {reagent.description 
                        ? reagent.description 
                        : <span className="text-gray-400 not-italic">Nenhuma descrição ou observação registrada para este item.</span>
                    }
                </div>
            </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
                onClick={onClose} 
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors shadow-sm"
            >
                Fechar Detalhes
            </button>
        </div>

      </div>
    </div>
  );
};