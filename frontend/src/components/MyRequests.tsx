// frontend/src/components/MyRequests.tsx

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { User } from '../types';
import { RequestModal } from './RequestModal'; // <--- Importação da Modal

interface MyRequestsProps {
  user: User;
}

export const MyRequests: React.FC<MyRequestsProps> = ({ user }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar a Modal de Detalhes
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // ATUALIZADO: Adiciona ?onlyMine=true para garantir que venham apenas os pedidos do usuário logado
      const response = await api.get('/requests?onlyMine=true');
      setRequests(response.data);
    } catch (error) {
      toast.error("Erro ao carregar histórico de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir os detalhes
  const openDetails = (req: any) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1 w-fit mx-auto"><i className="fa-solid fa-clock"></i> Em Análise</span>;
      case 'APPROVED': 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit mx-auto"><i className="fa-solid fa-person-walking-luggage"></i> Aguardando Retirada</span>;
      case 'COMPLETED': 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit mx-auto"><i className="fa-solid fa-check-circle"></i> Finalizado</span>;
      case 'REJECTED': 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit mx-auto"><i className="fa-solid fa-ban"></i> Recusado</span>;
      default: return null;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500">
        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Carregando seus pedidos...
    </div>
  );

  return (
    <>
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-list-check text-blue-600"></i> Meus Pedidos
        </h2>
        <p className="text-sm text-gray-500 mt-1">Clique em um pedido na lista para ver os detalhes e a justificativa.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Itens Solicitados</th>
                <th className="p-4 text-center">Status Atual</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {requests.length > 0 ? requests.map(req => (
                <tr 
                    key={req.id} 
                    onClick={() => openDetails(req)} // <--- Clique para abrir detalhes
                    className="hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                    {/* Coluna DATA */}
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap align-top">
                        <div className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                            {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-400">
                            {new Date(req.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </td>

                    {/* Coluna ITENS */}
                    <td className="p-4 align-top">
                        <ul className="space-y-2">
                            {req.items.map((item: any) => (
                                <li key={item.id} className="text-sm text-gray-700 flex justify-between items-center max-w-sm border-b border-gray-100 last:border-0 pb-1">
                                    <span className="font-medium">{item.reagent.name}</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.quantity}{item.reagent.unit}</span>
                                </li>
                            ))}
                        </ul>
                        {/* Pequeno indicador visual de que há mais detalhes */}
                        <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-eye mr-1"></i> Clique para ver detalhes
                        </div>
                    </td>

                    {/* Coluna STATUS */}
                    <td className="p-4 text-center align-top">
                        <div className="flex flex-col items-center gap-2">
                            {getStatusBadge(req.status)}
                            {req.status === 'APPROVED' && (
                                <p className="text-[11px] text-blue-600 font-medium animate-pulse bg-blue-50 px-2 py-1 rounded border border-blue-100 mt-1">
                                    Disponível para retirada.
                                </p>
                            )}
                        </div>
                    </td>
                </tr>
                )) : (
                <tr><td colSpan={3} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-clipboard-list text-4xl opacity-20"></i>
                        <p>Você ainda não realizou nenhum pedido.</p>
                    </div>
                </td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>

    {/* MODAL DE DETALHES INTEGRADA */}
    <RequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        request={selectedRequest} 
        mode="DETAILS" 
    />
    </>
  );
};