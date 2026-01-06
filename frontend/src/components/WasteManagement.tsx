// frontend/src/components/WasteManagement.tsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import { WasteContainer, WasteLog } from '../types';
import { generateWasteCSV, generateWastePDF } from '../utils/reportGenerator';

interface WasteManagementProps {
  user: any;
}

export const WasteManagement: React.FC<WasteManagementProps> = ({ user }) => {
  const [containers, setContainers] = useState<WasteContainer[]>([]);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterContainerId, setFilterContainerId] = useState('all');

  // --- MODAIS ---
  const [showLogModal, setShowLogModal] = useState(false);
  const [showContainerModal, setShowContainerModal] = useState(false);

  // --- ESTADOS DE FORMULÁRIO (CRUD) ---
  // Se editingContainerId for null = Criando. Se tiver ID = Editando.
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);
  
  const [newLog, setNewLog] = useState({ description: '', quantity: '', containerId: '' });
  // Renomeei de 'newContainer' para 'containerForm' pois serve para editar também
  const [containerForm, setContainerForm] = useState({ identifier: '', type: '', capacity: '', location: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [containersRes, logsRes] = await Promise.all([
        api.get('/waste/containers'),
        api.get('/waste/logs')
      ]);
      setContainers(Array.isArray(containersRes.data) ? containersRes.data : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA CRUD BOMBONAS ---

  const openCreateModal = () => {
      setEditingContainerId(null); // Modo Criação
      setContainerForm({ identifier: '', type: '', capacity: '', location: '' }); // Limpa form
      setShowContainerModal(true);
  };

  const openEditModal = (container: WasteContainer) => {
      setEditingContainerId(container.id); // Modo Edição
      setContainerForm({
          identifier: container.identifier,
          type: container.type,
          capacity: String(container.capacity),
          location: container.location
      });
      setShowContainerModal(true);
  };

  const handleSaveContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...containerForm, capacity: Number(containerForm.capacity) };
      
      if (editingContainerId) {
          // ATUALIZAR (PUT)
          await api.put(`/waste/containers/${editingContainerId}`, payload);
          alert("Bombona atualizada com sucesso!");
      } else {
          // CRIAR (POST)
          await api.post('/waste/containers', payload);
          alert("Bombona cadastrada!");
      }

      setShowContainerModal(false);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar bombona. Verifique se o backend suporta essa operação.");
    }
  };

  const handleDeleteContainer = async (id: string) => {
      if (!window.confirm("Tem certeza? Se houver histórico nesta bombona, ela pode não ser excluída.")) return;

      try {
          await api.delete(`/waste/containers/${id}`);
          alert("Bombona removida!");
          fetchData();
      } catch (error) {
          alert("Erro ao excluir. Verifique se existem descartes vinculados a esta bombona.");
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
    } catch (error: any) { alert(error.response?.data?.error || "Erro ao registrar."); }
  };

  // --- LÓGICA DE FILTRAGEM (Mantida igual) ---
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContainer = filterContainerId === 'all' || log.containerId === filterContainerId;
    let matchesDate = true;
    const logDate = new Date(log.date).setHours(0,0,0,0);
    if (filterStartDate) {
        const startDate = new Date(filterStartDate).setHours(0,0,0,0);
        if (logDate < startDate) matchesDate = false;
    }
    if (filterEndDate) {
        const endDate = new Date(filterEndDate).setHours(0,0,0,0);
        if (logDate > endDate) matchesDate = false;
    }
    return matchesSearch && matchesContainer && matchesDate;
  });

  const getReportData = () => {
    return filteredLogs.map(log => {
        const containerName = containers.find(c => c.id === log.containerId)?.identifier || 'N/A';
        return {
            id: log.id,
            date: log.date,
            reagentName: log.description,
            amount: log.quantity,
            unit: 'L',
            registeredBy: log.user?.name || 'Desconhecido',
            destination: `Bombona ${containerName}`
        };
    });
  };

  const clearFilters = () => {
      setSearchTerm('');
      setFilterStartDate('');
      setFilterEndDate('');
      setFilterContainerId('all');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (errorMsg) return <div className="p-8 text-center text-red-600">{errorMsg}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestão de Resíduos</h2>
            <p className="text-sm text-gray-500">Monitoramento e Histórico de Descarte</p>
        </div>
        <div className="flex gap-3">
            {user.role === 'ADMIN' && (
                <button onClick={openCreateModal} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <i className="fa-solid fa-box"></i> Nova Bombona
                </button>
            )}
            <button onClick={() => setShowLogModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-colors">
                <i className="fa-solid fa-plus"></i> Registrar Descarte
            </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <i className="fa-solid fa-filter text-blue-500"></i> Filtros & Relatórios
                </h3>
                <span className="text-xs text-gray-400">{filteredLogs.length} registro(s)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="col-span-1 md:col-span-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Buscar</label>
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
                        <input type="text" placeholder="Reagente ou Responsável..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                {user.role === 'ADMIN' && (
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Bombona</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={filterContainerId} onChange={(e) => setFilterContainerId(e.target.value)}>
                            <option value="all">Todas as Bombonas</option>
                            {containers.map(c => (<option key={c.id} value={c.id}>{c.identifier} - {c.type}</option>))}
                        </select>
                    </div>
                )}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Data Início</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Data Fim</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                    </div>
                    <button onClick={clearFilters} title="Limpar Filtros" className="mb-[1px] px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors"><i className="fa-solid fa-eraser"></i></button>
                </div>
            </div>
            {user.role === 'ADMIN' && (
                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
                    <button onClick={() => generateWasteCSV(getReportData())} disabled={filteredLogs.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"><i className="fa-solid fa-file-csv"></i> Baixar Excel/CSV</button>
                    <button onClick={() => generateWastePDF(getReportData())} disabled={filteredLogs.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"><i className="fa-solid fa-file-pdf"></i> Baixar PDF</button>
                </div>
            )}
        </div>
      </div>

      {/* LISTA VISUAL DAS BOMBONAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(containers) && containers.map(container => {
            const percentage = Math.min((container.currentVolume / container.capacity) * 100, 100);
            const isFull = percentage >= 90;
            const isSelected = filterContainerId === 'all' || filterContainerId === container.id;
            
            return (
                <div key={container.id} className={`relative bg-white p-5 rounded-xl shadow-sm border transition-all group ${isSelected ? 'border-gray-300 opacity-100' : 'border-gray-100 opacity-40'}`}>
                    
                    {/* AÇÕES DE EDITAR/EXCLUIR (ADMIN ONLY) */}
                    {user.role === 'ADMIN' && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(container); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Editar">
                                <i className="fa-solid fa-pen text-sm"></i>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteContainer(container.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Excluir">
                                <i className="fa-solid fa-trash text-sm"></i>
                            </button>
                        </div>
                    )}

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
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <i className="fa-solid fa-location-dot"></i> {container.location}
                    </div>
                </div>
            );
        })}
      </div>

      {/* TABELA DE HISTÓRICO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr><th className="p-4">Data</th><th className="p-4">Responsável</th><th className="p-4">Resíduo</th><th className="p-4">Qtd (L)</th><th className="p-4">Destino</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredLogs.length > 0 ? filteredLogs.map(log => {
                    const container = containers.find(c => c.id === log.containerId);
                    return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm text-gray-600">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                            <td className="p-4 text-sm font-medium">{log.user?.name || 'Desconhecido'}</td>
                            <td className="p-4 text-sm text-gray-600">{log.description}</td>
                            <td className="p-4 text-sm font-bold">{log.quantity}</td>
                            <td className="p-4 text-sm text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{container ? container.identifier : 'N/A'}</span></td>
                        </tr>
                    )
                }) : (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL BOMBONA (CRIAR / EDITAR) */}
      {showContainerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
                <h3 className="font-bold mb-4">{editingContainerId ? 'Editar Bombona' : 'Nova Bombona'}</h3>
                <form onSubmit={handleSaveContainer} className="space-y-3">
                    <input required placeholder="Identificador (Ex: B-01)" className="w-full p-2 border rounded" value={containerForm.identifier} onChange={e => setContainerForm({...containerForm, identifier: e.target.value})} />
                    <input required placeholder="Tipo (Ex: Ácidos)" className="w-full p-2 border rounded" value={containerForm.type} onChange={e => setContainerForm({...containerForm, type: e.target.value})} />
                    <input required type="number" placeholder="Capacidade (L)" className="w-full p-2 border rounded" value={containerForm.capacity} onChange={e => setContainerForm({...containerForm, capacity: e.target.value})} />
                    <input required placeholder="Localização" className="w-full p-2 border rounded" value={containerForm.location} onChange={e => setContainerForm({...containerForm, location: e.target.value})} />
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowContainerModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL DESCARTE (REGISTRAR) */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
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