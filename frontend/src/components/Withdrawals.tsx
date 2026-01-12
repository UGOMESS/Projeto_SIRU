// frontend/src/components/Withdrawals.tsx

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { RequestModal } from './RequestModal';

interface RequestItem {
  id: string;
  quantity: number;
  reagent: {
    name: string;
    unit: string;
  };
}

interface RequestData {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  reason?: string;
  user: {
    name: string;
  };
  items: RequestItem[];
}

export const Withdrawals: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados da Modal
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'DETAILS' | 'CONFIRM_ACTION'>('DETAILS');
  
  // Ação que o usuário "quer" fazer (Verbos)
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'COMPLETE' | undefined>(undefined);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests');
      setRequests(response.data);
    } catch (error) {
      toast.error("Erro ao carregar lista de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  // Prepara a modal para AÇÃO
  const promptAction = (req: RequestData, type: 'APPROVE' | 'REJECT' | 'COMPLETE', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRequest(req);
    setModalMode('CONFIRM_ACTION');
    setActionType(type);
    setIsModalOpen(true);
  };

  // Abre modal apenas para DETALHES
  const openDetails = (req: RequestData) => {
    setSelectedRequest(req);
    setModalMode('DETAILS');
    setIsModalOpen(true);
  };

  // Executa a ação
  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    // --- CORREÇÃO PRINCIPAL ---
    // Mapeamos a AÇÃO (interface) para o STATUS (backend)
    let backendStatus = '';
    if (actionType === 'APPROVE') backendStatus = 'APPROVED';
    if (actionType === 'REJECT') backendStatus = 'REJECTED';
    if (actionType === 'COMPLETE') backendStatus = 'COMPLETED';

    try {
      await api.patch(`/requests/${selectedRequest.id}/status`, { status: backendStatus });
      
      if (actionType === 'APPROVE') toast.success("Pedido autorizado com sucesso!");
      else if (actionType === 'COMPLETE') toast.success("Retirada confirmada e estoque baixado!");
      else toast.info("Pedido rejeitado.");
      
      setIsModalOpen(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao atualizar status.");
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const awaitingPickupRequests = requests.filter(r => r.status === 'APPROVED');
  const historyRequests = requests.filter(r => ['COMPLETED', 'REJECTED'].includes(r.status));

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500">
        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Carregando central...
    </div>
  );

  return (
    <>
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-dolly text-purple-600"></i> Central de Pedidos
        </h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie solicitações e autorize a saída de materiais.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* COLUNA 1: NOVOS PEDIDOS */}
        <div className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2 border-gray-200">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>
                Novas Solicitações
            </h3>
            
            {pendingRequests.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
                    <i className="fa-regular fa-folder-open text-2xl mb-2"></i>
                    <p>Nenhum pedido pendente.</p>
                </div>
            )}

            {pendingRequests.map(req => (
                <div 
                    key={req.id} 
                    onClick={() => openDetails(req)}
                    className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-bold text-gray-800">{req.user.name}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(req.createdAt).toLocaleDateString('pt-BR')} às {new Date(req.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                        <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver detalhes <i className="fa-solid fa-arrow-right"></i>
                        </span>
                    </div>

                    <div className="bg-yellow-50/50 p-3 rounded-lg mb-3 border border-yellow-100">
                        <ul className="text-sm space-y-1">
                            {req.items.map((item) => (
                                <li key={item.id} className="flex justify-between text-gray-700">
                                    <span>{item.reagent.name}</span>
                                    <span className="font-bold">{item.quantity}{item.reagent.unit}</span>
                                </li>
                            ))}
                        </ul>
                        {req.reason && (
                            <div className="mt-2 pt-2 border-t border-yellow-200 text-xs text-gray-600 italic truncate">
                                "{req.reason}"
                            </div>
                        )}
                    </div>

                    {/* Botões de Ação Corrigidos: Passando APPROVE/REJECT em vez de APPROVED/REJECTED */}
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => promptAction(req, 'APPROVE', e)} 
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <i className="fa-solid fa-check mr-1"></i> Autorizar
                        </button>
                        <button 
                            onClick={(e) => promptAction(req, 'REJECT', e)} 
                            className="px-4 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* COLUNA 2: AGUARDANDO RETIRADA */}
        <div className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2 border-gray-200">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{awaitingPickupRequests.length}</span>
                Aguardando Retirada
            </h3>

            {awaitingPickupRequests.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
                    <i className="fa-solid fa-person-walking-luggage text-2xl mb-2 opacity-50"></i>
                    <p>Ninguém aguardando retirada.</p>
                </div>
            )}

            {awaitingPickupRequests.map(req => (
                <div 
                    key={req.id} 
                    onClick={() => openDetails(req)}
                    className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-800">{req.user.name}</p>
                                <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Autorizado</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                             <ul className="text-sm space-y-1">
                                {req.items.map((item) => (
                                    <li key={item.id} className="flex justify-between text-gray-600">
                                        <span>{item.reagent.name}</span>
                                        <span>{item.quantity}{item.reagent.unit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Botão Corrigido: Passando COMPLETE em vez de COMPLETED */}
                        <button 
                            onClick={(e) => promptAction(req, 'COMPLETE', e)} 
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-clipboard-check"></i> 
                            Confirmar Entrega
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      

      {/* Histórico */}
      <div className="mt-12 pt-6 border-t border-gray-200">
         <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left"></i> Histórico Recente
         </h3>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="p-3 pl-4">Data</th>
                        <th className="p-3">Pesquisador</th>
                        <th className="p-3">Itens</th>
                        <th className="p-3 text-center">Status Final</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {historyRequests.slice(0, 10).map(req => (
                        <tr key={req.id} onClick={() => openDetails(req)} className="hover:bg-gray-50 cursor-pointer">
                            <td className="p-3 pl-4 text-gray-500">{new Date(req.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="p-3 font-medium">{req.user.name}</td>
                             <td className="p-3 text-gray-500 text-xs max-w-xs truncate">
                                {req.items.map((i) => i.reagent.name).join(', ')}
                            </td>
                            <td className="p-3 text-center">
                                {req.status === 'COMPLETED' 
                                    ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold"><i className="fa-solid fa-check"></i> Entregue</span> 
                                    : <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold"><i className="fa-solid fa-ban"></i> Negado</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

    </div>

    <RequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        request={selectedRequest} 
        mode={modalMode}
        actionType={actionType}
        onConfirm={handleConfirmAction}
    />
    </>
  );
};