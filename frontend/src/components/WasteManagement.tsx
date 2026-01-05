// frontend/src/components/WasteManagement.tsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import { WasteContainer, WasteLog } from '../types';

interface WasteManagementProps {
  user: any;
}

export const WasteManagement: React.FC<WasteManagementProps> = ({ user }) => {
  // Inicializa como arrays vazios GARANTIDOS
  const [containers, setContainers] = useState<WasteContainer[]>([]);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showLogModal, setShowLogModal] = useState(false);
  const [showContainerModal, setShowContainerModal] = useState(false);

  const [newLog, setNewLog] = useState({ description: '', quantity: '', containerId: '' });
  const [newContainer, setNewContainer] = useState({ identifier: '', type: '', capacity: '', location: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log("Tentando buscar dados de resíduos..."); // DEBUG

      const [containersRes, logsRes] = await Promise.all([
        api.get('/waste/containers'),
        api.get('/waste/logs')
      ]);

      console.log("Dados recebidos (Containers):", containersRes.data); // DEBUG
      console.log("Dados recebidos (Logs):", logsRes.data); // DEBUG

      // Proteção: Só salva se for array. Se não for, salva lista vazia.
      setContainers(Array.isArray(containersRes.data) ? containersRes.data : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

    } catch (error: any) {
      console.error("Erro FATAL ao carregar resíduos:", error);
      // Se for erro 404, significa que a rota não existe no backend ainda
      if (error.response?.status === 404) {
        setErrorMsg("Erro 404: O Backend não encontrou as rotas de resíduos. Reinicie o servidor backend.");
      } else {
        setErrorMsg("Erro ao carregar dados. Verifique o console (F12).");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/waste/containers', {
        ...newContainer,
        capacity: Number(newContainer.capacity)
      });
      alert("Bombona cadastrada!");
      setShowContainerModal(false);
      fetchData();
      setNewContainer({ identifier: '', type: '', capacity: '', location: '' });
    } catch (error) {
      alert("Erro ao criar bombona.");
    }
  };

  const handleRegisterLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newLog.containerId) return alert("Selecione uma bombona!");
      await api.post('/waste/logs', {
        description: newLog.description,
        quantity: Number(newLog.quantity),
        containerId: newLog.containerId
      });
      alert("Descarte registrado!");
      setShowLogModal(false);
      fetchData();
      setNewLog({ description: '', quantity: '', containerId: '' });
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao registrar descarte.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando gestão de resíduos...</div>;

  if (errorMsg) return (
    <div className="p-8 text-center">
        <div className="text-red-600 font-bold mb-2">Ocorreu um problema:</div>
        <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200 inline-block">
            {errorMsg}
        </div>
        <button onClick={fetchData} className="block mx-auto mt-4 text-blue-600 underline">Tentar novamente</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Gestão de Resíduos</h2>
            <p className="text-sm text-gray-500">Controle de descarte químico</p>
        </div>
        <div className="flex gap-2">
            {user.role === 'ADMIN' && (
                <button onClick={() => setShowContainerModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                    <i className="fa-solid fa-box"></i> Nova Bombona
                </button>
            )}
            <button onClick={() => setShowLogModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                <i className="fa-solid fa-recycle"></i> Registrar Descarte
            </button>
        </div>
      </div>

      {/* LISTA DE BOMBONAS - Com proteção contra crash */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(containers) && containers.map(container => {
            const percentage = Math.min((container.currentVolume / container.capacity) * 100, 100);
            const isFull = percentage >= 90;
            return (
                <div key={container.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{container.identifier}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">{container.type}</span>
                        </div>
                        <i className={`fa-solid fa-drum-steelpan text-2xl ${isFull ? 'text-red-500' : 'text-green-500'}`}></i>
                    </div>
                    <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Ocupação</span>
                            <span className={`font-bold ${isFull ? 'text-red-600' : 'text-blue-600'}`}>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                </div>
            );
        })}
        {(!containers || containers.length === 0) && (
             <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Nenhuma bombona cadastrada.</p>
            </div>
        )}
      </div>

      {/* LISTA DE LOGS - Com proteção */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-700">Histórico</h3></div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr><th className="p-4">Data</th><th className="p-4">Responsável</th><th className="p-4">Resíduo</th><th className="p-4">Qtd (L)</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {Array.isArray(logs) && logs.map(log => (
                    <tr key={log.id}>
                        <td className="p-4 text-sm text-gray-600">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="p-4 text-sm font-medium">{log.user?.name || 'Desconhecido'}</td>
                        <td className="p-4 text-sm text-gray-600">{log.description}</td>
                        <td className="p-4 text-sm font-bold">{log.quantity}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL NOVA BOMBONA */}
      {showContainerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="font-bold mb-4">Nova Bombona</h3>
                <form onSubmit={handleCreateContainer} className="space-y-3">
                    <input required placeholder="Identificador (Ex: B-01)" className="w-full p-2 border rounded" value={newContainer.identifier} onChange={e => setNewContainer({...newContainer, identifier: e.target.value})} />
                    <input required placeholder="Tipo (Ex: Ácidos)" className="w-full p-2 border rounded" value={newContainer.type} onChange={e => setNewContainer({...newContainer, type: e.target.value})} />
                    <input required type="number" placeholder="Capacidade (L)" className="w-full p-2 border rounded" value={newContainer.capacity} onChange={e => setNewContainer({...newContainer, capacity: e.target.value})} />
                    <input required placeholder="Localização" className="w-full p-2 border rounded" value={newContainer.location} onChange={e => setNewContainer({...newContainer, location: e.target.value})} />
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowContainerModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL DESCARTE */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="font-bold mb-4">Registrar Descarte</h3>
                <form onSubmit={handleRegisterLog} className="space-y-3">
                    <input required placeholder="Descrição do Resíduo" className="w-full p-2 border rounded" value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})} />
                    <input required type="number" placeholder="Quantidade (L)" className="w-full p-2 border rounded" value={newLog.quantity} onChange={e => setNewLog({...newLog, quantity: e.target.value})} />
                    <select required className="w-full p-2 border rounded bg-white" value={newLog.containerId} onChange={e => setNewLog({...newLog, containerId: e.target.value})}>
                        <option value="">Selecione a Bombona...</option>
                        {containers.filter(c => c.isActive).map(c => (
                            <option key={c.id} value={c.id}>{c.identifier} - {c.type}</option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};