// frontend/src/components/RequestModal.tsx

import React from 'react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any; // O objeto do pedido
  mode: 'DETAILS' | 'CONFIRM_ACTION'; // Modo de visualização ou confirmação
  actionType?: 'APPROVE' | 'REJECT' | 'COMPLETE'; // Qual ação está sendo confirmada (apenas para Admin)
  onConfirm?: () => void; // Função ao clicar em confirmar
}

export const RequestModal: React.FC<RequestModalProps> = ({ 
  isOpen, onClose, request, mode, actionType, onConfirm 
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        {/* CABEÇALHO */}
        <div className={`p-4 flex justify-between items-center ${mode === 'CONFIRM_ACTION' ? 'bg-gray-50 border-b border-gray-200' : 'bg-blue-600'}`}>
          <h3 className={`font-bold text-lg ${mode === 'CONFIRM_ACTION' ? 'text-gray-800' : 'text-white'}`}>
            {mode === 'DETAILS' ? 'Detalhes da Solicitação' : 'Confirmar Ação'}
          </h3>
          <button onClick={onClose} className={`hover:opacity-75 transition-opacity ${mode === 'CONFIRM_ACTION' ? 'text-gray-500' : 'text-white'}`}>
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6 space-y-4">
          
          {/* SEÇÃO DE CONFIRMAÇÃO (Só aparece se mode for CONFIRM_ACTION) */}
          {mode === 'CONFIRM_ACTION' && (
             <div className="text-center mb-6">
                <i className={`fa-solid text-4xl mb-3 ${
                    actionType === 'APPROVE' ? 'fa-check-circle text-blue-500' :
                    actionType === 'REJECT' ? 'fa-circle-xmark text-red-500' :
                    'fa-clipboard-check text-green-500'
                }`}></i>
                <p className="text-lg text-gray-700 font-medium">
                    {actionType === 'APPROVE' && "Deseja autorizar esta retirada?"}
                    {actionType === 'REJECT' && "Tem certeza que deseja recusar este pedido?"}
                    {actionType === 'COMPLETE' && "Confirmar que o pesquisador retirou os itens?"}
                </p>
                {actionType === 'COMPLETE' && (
                    <p className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded border border-red-100">
                        <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                        Isso irá baixar o estoque permanentemente.
                    </p>
                )}
             </div>
          )}

          {/* DADOS DO PEDIDO (Visível em ambos os modos) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-3">
             <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Solicitante:</span>
                <span className="font-bold text-gray-800">{request.user?.name || 'Eu'}</span>
             </div>
             <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Data do Pedido:</span>
                <span className="font-medium">{new Date(request.createdAt).toLocaleDateString('pt-BR')} às {new Date(request.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
             </div>
             
             {/* EXIBIÇÃO DO MOTIVO */}
             <div className="pt-1">
                <span className="text-gray-500 block mb-1 font-medium">Motivo da Utilização:</span>
                <div className="text-gray-700 italic bg-white p-3 rounded border border-gray-200 shadow-sm">
                    "{request.reason || "Nenhum motivo informado."}"
                </div>
             </div>

             <div className="pt-2">
                <span className="text-gray-500 block mb-1 font-medium">Itens Solicitados:</span>
                <ul className="space-y-1">
                    {request.items.map((item: any) => (
                        <li key={item.id} className="flex justify-between bg-white px-3 py-2 rounded border border-gray-200">
                            <span className="text-gray-700">{item.reagent.name}</span>
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded">{item.quantity}{item.reagent.unit}</span>
                        </li>
                    ))}
                </ul>
             </div>
          </div>

        </div>

        {/* RODAPÉ (BOTÕES) */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            {mode === 'DETAILS' ? 'Fechar' : 'Cancelar'}
          </button>
          
          {mode === 'CONFIRM_ACTION' && onConfirm && (
             <button 
                onClick={onConfirm}
                className={`px-6 py-2 text-white rounded-lg font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2 ${
                    actionType === 'REJECT' ? 'bg-red-500 hover:bg-red-600' : 
                    actionType === 'COMPLETE' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-blue-600 hover:bg-blue-700'
                }`}
             >
                {actionType === 'REJECT' && <i className="fa-solid fa-ban"></i>}
                {actionType === 'COMPLETE' && <i className="fa-solid fa-check"></i>}
                {actionType === 'APPROVE' && <i className="fa-solid fa-thumbs-up"></i>}
                Confirmar
             </button>
          )}
        </div>

      </div>
    </div>
  );
};