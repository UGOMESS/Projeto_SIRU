// frontend/src/components/WasteManagement.tsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import { WasteContainer, WasteLog } from '../types';
import { generateWasteCSV, generateWastePDF } from '../utils/reportGenerator';
import { toast } from 'react-toastify';

// --- SUB-COMPONENTE: Modal de Confirmação de Exclusão ---
const DeleteWasteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <i className="fa-solid fa-trash-can text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Excluir Bombona?</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Tem certeza que deseja excluir <strong>{itemName}</strong>? <br/>
                        Esta ação removerá todo o histórico deste resíduo.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition-colors">
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
  
  // Estado para Modal de Exclusão
  const [containerToDelete, setContainerToDelete] = useState<WasteContainer | null>(null);

  // --- ESTADOS DE FORMULÁRIO (CRUD) ---
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);
  
  const [newLog, setNewLog] = useState({ description: '', quantity: '', containerId: '' });
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
      toast.error("Erro de conexão ao carregar dados.");
      setErrorMsg("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA CRUD BOMBONAS ---

  const openCreateModal = () => {
      setEditingContainerId(null);
      setContainerForm({ identifier: '', type: '', capacity: '', location: '' });
      setShowContainerModal(true);
  };

  const openEditModal = (container: WasteContainer) => {
      setEditingContainerId(container.id);
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
    
    if (!containerForm.identifier || !containerForm.capacity || !containerForm.type) {
        toast.warning("Preencha Identificador, Tipo e Capacidade.");
        return;
    }

    try {
      const payload = { ...containerForm, capacity: Number(containerForm.capacity) };
      
      if (editingContainerId) {
          await api.put(`/waste/containers/${editingContainerId}`, payload);
          toast.success("Bombona atualizada com sucesso!");
      } else {
          await api.post('/waste/containers', payload);
          toast.success("Bombona criada com sucesso!");
      }

      setShowContainerModal(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao salvar bombona.");
    }
  };

  // 1. Solicitar Exclusão (Abre Modal)
  const handleRequestDelete = (container: WasteContainer) => {
      setContainerToDelete(container);
  };

  // 2. Confirmar Exclusão (Executa API)
  const confirmDeleteContainer = async () => {
      if (!containerToDelete) return;

      try {
          await api.delete(`/waste/containers/${containerToDelete.id}`);
          toast.success("Bombona removida.");
          fetchData();
      } catch (error: any) {
          const msg = error.response?.data?.error || "Erro ao excluir.";
          toast.error(msg);
      } finally {
          setContainerToDelete(null); // Fecha o modal
      }
  };

  const handleRegisterLog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLog.containerId) {
        toast.warning("Selecione uma bombona de destino.");
        return;
    }
    if (!newLog.quantity || Number(newLog.quantity) <= 0) {
        toast.warning("Informe uma quantidade válida.");
        return;
    }

    try {
      await api.post('/waste/logs', {
        description: newLog.description,
        quantity: Number(newLog.quantity),
        containerId: newLog.containerId
      });
      
      toast.success("Descarte registrado! ♻️");
      setShowLogModal(false);
      fetchData();
      setNewLog({ description: '', quantity: '', containerId: '' });
    } catch (error: any) { 
        const msg = error.response?.data?.error || "Erro ao registrar descarte.";
        toast.error(msg);
    }
  };

  // --- LÓGICA DE FILTRAGEM ---
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
      toast.info("Filtros limpos.");
  };

  const handleDownload = (type: 'csv' | 'pdf') => {
      if(filteredLogs.length === 0) {
          toast.warning("Sem dados para exportar.");
          return;
      }
      if(type === 'csv') generateWasteCSV(getReportData());
      else generateWastePDF(getReportData());
      toast.success("Download iniciado!");
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
  
  if (errorMsg) return (
    <div className="p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 inline-block">
            {errorMsg}
        </div>
        <button onClick={fetchData} className="block mx-auto mt-4 text-blue-600 hover:underline">Tentar novamente</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Modal de Confirmação de Exclusão */}
      <DeleteWasteModal 
        isOpen={!!containerToDelete} 
        onClose={() => setContainerToDelete(null)} 
        onConfirm={confirmDeleteContainer} 
        itemName={containerToDelete?.identifier || 'Bombona'} 
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-recycle text-green-600"></i> Gestão de Resíduos
            </h2>
            <p className="text-sm text-gray-500">Monitoramento e histórico de descarte químico.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            {user.role === 'ADMIN' && (
                <button onClick={openCreateModal} className="flex-1 md:flex-none bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
                    <i className="fa-solid fa-box"></i> <span className="hidden sm:inline">Nova Bombona</span>
                </button>
            )}
            <button onClick={() => setShowLogModal(true)} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm font-medium transition-colors">
                <i className="fa-solid fa-plus"></i> <span>Registrar Descarte</span>
            </button>
        </div>
      </div>

      {/* PAINEL DE FILTROS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <i className="fa-solid fa-filter text-blue-500"></i> Filtros & Relatórios
                </h3>
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">{filteredLogs.length} registros</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="col-span-1 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Buscar</label>
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
                        <input type="text" placeholder="Reagente ou Responsável..." className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                {user.role === 'ADMIN' && (
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bombona</label>
                        <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={filterContainerId} onChange={(e) => setFilterContainerId(e.target.value)}>
                            <option value="all">Todas as Bombonas</option>
                            {containers.map(c => (<option key={c.id} value={c.id}>{c.identifier} - {c.type}</option>))}
                        </select>
                    </div>
                )}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data Início</label>
                    <input type="date" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data Fim</label>
                        <input type="date" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                    </div>
                    <button onClick={clearFilters} title="Limpar Filtros" className="mb-[1px] px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors"><i className="fa-solid fa-eraser"></i></button>
                </div>
            </div>

            {user.role === 'ADMIN' && (
                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
                    <button onClick={() => handleDownload('csv')} disabled={filteredLogs.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><i className="fa-solid fa-file-csv"></i> Excel/CSV</button>
                    <button onClick={() => handleDownload('pdf')} disabled={filteredLogs.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><i className="fa-solid fa-file-pdf"></i> PDF</button>
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
                <div key={container.id} className={`bg-white p-5 rounded-xl shadow-sm border transition-all duration-200 ${isSelected ? 'border-gray-300 opacity-100 scale-100' : 'border-gray-100 opacity-60 scale-95'} hover:shadow-md`}>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{container.identifier}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block font-medium">{container.type}</span>
                        </div>
                        <i className={`fa-solid fa-drum-steelpan text-3xl transition-colors ${isFull ? 'text-red-500 animate-pulse' : 'text-green-500 opacity-70'}`}></i>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Ocupação</span>
                            <span className={`font-bold ${isFull ? 'text-red-600' : 'text-blue-600'}`}>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="mt-1 text-xs text-right text-gray-400">
                            {container.currentVolume}L / {container.capacity}L
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                        <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                            <i className="fa-solid fa-location-dot text-gray-400"></i> {container.location}
                        </div>

                        {user.role === 'ADMIN' && (
                            <div className="flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(container); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                    <i className="fa-solid fa-pen-to-square text-lg"></i>
                                </button>
                                {/* BOTÃO DE EXCLUIR ATUALIZADO */}
                                <button onClick={(e) => { e.stopPropagation(); handleRequestDelete(container); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                                    <i className="fa-solid fa-trash-can text-lg"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      {/* TABELA DE HISTÓRICO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <tr><th className="p-4 font-semibold">Data</th><th className="p-4 font-semibold">Responsável</th><th className="p-4 font-semibold">Resíduo</th><th className="p-4 font-semibold">Qtd (L)</th><th className="p-4 font-semibold">Destino</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredLogs.length > 0 ? filteredLogs.map(log => {
                    const container = containers.find(c => c.id === log.containerId);
                    return (
                        <tr key={log.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="p-4 text-sm text-gray-600">{new Date(log.date).toLocaleDateString('pt-BR')} <span className="text-xs text-gray-400 ml-1">{new Date(log.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span></td>
                            <td className="p-4 text-sm font-medium text-gray-800">{log.user?.name || 'Desconhecido'}</td>
                            <td className="p-4 text-sm text-gray-600">{log.description}</td>
                            <td className="p-4 text-sm font-bold text-gray-700">{log.quantity}</td>
                            <td className="p-4 text-sm text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">{container ? container.identifier : 'N/A'}</span></td>
                        </tr>
                    )
                }) : (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                            <i className="fa-solid fa-filter-circle-xmark text-4xl text-gray-200"></i>
                            <p>Nenhum registro encontrado.</p>
                            <button onClick={clearFilters} className="text-blue-600 text-sm hover:underline font-medium">Limpar filtros</button>
                        </div>
                    </td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL BOMBONA */}
      {showContainerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-xl text-gray-800">{editingContainerId ? 'Editar Bombona' : 'Nova Bombona'}</h3>
                    <button onClick={() => setShowContainerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <form onSubmit={handleSaveContainer} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Identificador</label>
                        <input required placeholder="Ex: B-01" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={containerForm.identifier} onChange={e => setContainerForm({...containerForm, identifier: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Resíduo</label>
                        <input required placeholder="Ex: Solventes Orgânicos" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={containerForm.type} onChange={e => setContainerForm({...containerForm, type: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacidade (L)</label>
                            <input required type="number" step="0.1" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={containerForm.capacity} onChange={e => setContainerForm({...containerForm, capacity: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Localização</label>
                            <input required placeholder="Ex: Armário 2" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={containerForm.location} onChange={e => setContainerForm({...containerForm, location: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setShowContainerModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-md transition-transform active:scale-95">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL DESCARTE */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-xl text-gray-800">Registrar Descarte</h3>
                    <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <form onSubmit={handleRegisterLog} className="p-6 space-y-4">
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">O que está sendo descartado?</label>
                        <input required placeholder="Ex: Resto de titulação de HCl" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})} />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantidade (Litros)</label>
                        <input required type="number" step="0.01" placeholder="0.5" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" value={newLog.quantity} onChange={e => setNewLog({...newLog, quantity: e.target.value})} />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destino</label>
                        <select required className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all cursor-pointer" value={newLog.containerId} onChange={e => setNewLog({...newLog, containerId: e.target.value})}>
                            <option value="">Selecione a Bombona...</option>
                            {containers.filter(c => c.isActive).map(c => (
                                <option key={c.id} value={c.id}>{c.identifier} - {c.type} (Disp: {(c.capacity - c.currentVolume).toFixed(1)}L)</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-transform active:scale-95">Confirmar Descarte</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};