import React from 'react';
import { WithdrawalRequest, RequestStatus } from '../types';

interface WithdrawalsProps {
  requests: WithdrawalRequest[];
  onAction: (id: string, newStatus: RequestStatus) => void;
}

export const Withdrawals: React.FC<WithdrawalsProps> = ({ requests, onAction }) => {
  
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-500 text-lg">
          <i className="fa-solid fa-box-open mb-2 text-2xl block"></i>
          Nenhuma solicitação encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="font-bold text-gray-700">
          <i className="fa-solid fa-clipboard-list mr-2"></i>
          Lista Geral de Pedidos ({requests.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reagente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qtd.</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status === 'PENDING' ? 'Pendente' : 
                     req.status === 'APPROVED' ? 'Aprovado' : 'Recusado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{req.reagentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{req.amount} {req.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs font-bold text-gray-600">
                       {req.requestedBy ? req.requestedBy.charAt(0).toUpperCase() : '?'}
                    </div>
                    {req.requestedBy}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                  {new Date(req.requestedAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {req.status === 'PENDING' ? (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onAction(req.id, 'APPROVED' as any)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md shadow-sm transition-all"
                        title="Aprovar"
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                      <button
                        onClick={() => onAction(req.id, 'REJECTED' as any)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow-sm transition-all"
                        title="Recusar"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      {req.status === 'APPROVED' ? 'Processado' : 'Cancelado'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};