// frontend/src/components/Inventory.tsx

import React, { useState } from 'react';
import { Reagent, User, WithdrawalRequest, RequestStatus } from '../types';
// 1. IMPORTAR TOAST
import { toast } from 'react-toastify';

interface InventoryProps {
  reagents: Reagent[];
  user: User;
  onAddReagent: (reagent: Reagent) => void;
  onDeleteReagent: (id: string) => void;
  onUpdateReagent: (reagent: Reagent) => void;
  onRequestWithdrawal: (request: WithdrawalRequest) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  reagents, 
  user, 
  onAddReagent, 
  onDeleteReagent, 
  onUpdateReagent,
  onRequestWithdrawal 
}) => {
  // --- Estados de Controle ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null);
  
  // Estado para Modal de Retirada
  const [withdrawalReagent, setWithdrawalReagent] = useState<Reagent | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>(''); // Mudado para string para facilitar input
  const [withdrawReason, setWithdrawReason] = useState('');

  // --- Estado do Formulário ---
  const initialFormState = {
    name: '',
    casNumber: '',
    category: 'Outros',
    description: '',
    formula: '',
    quantity: '', // String para input controlado
    unit: 'ML',
    minStockLevel: '10', // String para input controlado
    location: '',
    expirationDate: '',
    isControlled: false
  };
  // @ts-ignore - Ignorando erro de tipagem temporário no state inicial vs Reagent type
  const [formData, setFormData] = useState(initialFormState);

  // --- Listas Auxiliares ---
  const categories = ['Todos', 'Ácidos', 'Bases', 'Sais', 'Solventes', 'Outros'];
  const formCategories = ['Ácidos', 'Bases', 'Sais', 'Solventes', 'Outros'];

  // --- Helpers de Status Visual ---
  const getStockStatus = (reagent: Reagent) => {
    const today = new Date();
    const expDate = new Date(reagent.expirationDate);
    
    if (expDate < today) return { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200' };
    if (reagent.quantity <= reagent.minStockLevel) return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'OK', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  // --- Lógica de Filtro ---
  const filteredReagents = reagents.filter(reagent => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = reagent.name.toLowerCase().includes(term) ||
                          (reagent.casNumber && reagent.casNumber.includes(term)) ||
                          (reagent.formula && reagent.formula.toLowerCase().includes(term));
    
    let matchesCategory = false;
    if (selectedCategory === 'Todos') {
        matchesCategory = true;
    } else {
        const categoryVariations: { [key: string]: string[] } = {
            'Ácidos': ['ácido', 'ácidos'],
            'Bases': ['base', 'bases'],
            'Sais': ['sal', 'sais'],
            'Solventes': ['solvente', 'solventes'],
            'Outros': ['outro', 'outros']
        };
        const validTerms = categoryVariations[selectedCategory] || [selectedCategory.toLowerCase()];
        const itemCat = reagent.category ? reagent.category.toLowerCase().trim() : '';
        matchesCategory = validTerms.some(term => itemCat.includes(term));
    }
    return matchesSearch && matchesCategory;
  });

  // --- Handlers do Formulário ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openCreateModal = () => {
    setEditingReagent(null);
    // @ts-ignore
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (reagent: Reagent) => {
    setEditingReagent(reagent);
    setFormData({
      name: reagent.name,
      casNumber: reagent.casNumber || '',
      category: reagent.category,
      description: reagent.description || '',
      formula: reagent.formula || '',
      quantity: String(reagent.quantity),
      unit: reagent.unit,
      minStockLevel: String(reagent.minStockLevel),
      location: reagent.location || '',
      expirationDate: reagent.expirationDate ? new Date(reagent.expirationDate).toISOString().split('T')[0] : '',
      isControlled: reagent.isControlled
    });
    setIsModalOpen(true);
  };

  const handleSaveReagent = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação com Toast
    if (!formData.name || !formData.quantity || !formData.expirationDate) {
        toast.warning("Preencha os campos obrigatórios: Nome, Quantidade e Validade.");
        return;
    }

    const payload: any = {
        ...formData,
        quantity: Number(formData.quantity),
        minStockLevel: Number(formData.minStockLevel),
        expirationDate: new Date(formData.expirationDate).toISOString()
    };

    if (editingReagent) {
        onUpdateReagent({ ...payload, id: editingReagent.id, createdAt: editingReagent.createdAt });
    } else {
        onAddReagent(payload);
    }
    setIsModalOpen(false);
  };

  // --- Handlers de Retirada ---
  const openWithdrawModal = (reagent: Reagent) => {
      setWithdrawalReagent(reagent);
      setWithdrawAmount('');
      setWithdrawReason('');
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
     e.preventDefault();
     if (!withdrawalReagent) return;

     if (!withdrawAmount || Number(withdrawAmount) <= 0) {
         toast.warning("Informe uma quantidade válida.");
         return;
     }

     const newRequest: WithdrawalRequest = {
         id: '',
         reagentId: withdrawalReagent.id,
         reagentName: withdrawalReagent.name,
         amount: Number(withdrawAmount),
         unit: withdrawalReagent.unit,
         requestedAt: new Date().toISOString(),
         status: RequestStatus.PENDING,
         reason: withdrawReason,
         requestedBy: user.name,
     };
     
     onRequestWithdrawal(newRequest);
     setWithdrawalReagent(null);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <i className="fa-solid fa-flask text-blue-600"></i> Inventário
           </h2>
           <p className="text-sm text-gray-500">Gerencie o estoque de reagentes químicos.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Buscar (Nome, CAS, Fórmula)..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'Todos' ? 'Todas Categorias' : cat}</option>
            ))}
          </select>

          {user.role === 'ADMIN' && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium whitespace-nowrap"
            >
              <i className="fa-solid fa-plus"></i>
              <span className="hidden sm:inline">Novo</span>
            </button>
          )}
        </div>
      </div>

      {/* TABELA DE REAGENTES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Reagente</th>
                <th className="px-6 py-3 text-left font-semibold">Categoria</th>
                <th className="px-6 py-3 text-left font-semibold">Local</th>
                <th className="px-6 py-3 text-left font-semibold">Estoque</th>
                <th className="px-6 py-3 text-left font-semibold">Validade</th>
                <th className="px-6 py-3 text-center font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm">
              {filteredReagents.length > 0 ? (
                filteredReagents.map((reagent) => {
                  const status = getStockStatus(reagent);
                  return (
                  <tr key={reagent.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{reagent.name}</span>
                        <div className="flex gap-2 text-xs text-gray-400 font-mono mt-0.5">
                            {reagent.formula && <span>{reagent.formula}</span>}
                            {reagent.casNumber && <span>• CAS: {reagent.casNumber}</span>}
                        </div>
                        {reagent.isControlled && (
                           <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 w-fit mt-1 border border-red-200">
                             CONTROLADO
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {reagent.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                          <i className="fa-solid fa-location-dot text-gray-300"></i>
                          {reagent.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="font-bold text-gray-700">
                            {reagent.quantity} <span className="text-xs text-gray-500 font-normal">{reagent.unit}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                       {new Date(reagent.expirationDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            {status.label}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => openWithdrawModal(reagent)} 
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                                title="Solicitar Retirada"
                            >
                                <i className="fa-solid fa-hand-holding-droplet text-lg"></i>
                            </button>
                            {user.role === 'ADMIN' && (
                                <>
                                    <button 
                                        onClick={() => openEditModal(reagent)} 
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                        title="Editar"
                                    >
                                        <i className="fa-solid fa-pen-to-square text-lg"></i>
                                    </button>
                                    <button 
                                        onClick={() => onDeleteReagent(reagent.id)} 
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                        title="Excluir"
                                    >
                                        <i className="fa-solid fa-trash-can text-lg"></i>
                                    </button>
                                </>
                            )}
                        </div>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                          <i className="fa-solid fa-flask-vial text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-lg font-medium text-gray-600">Nenhum reagente encontrado.</p>
                      <p className="text-sm text-gray-400">Tente ajustar os filtros ou adicionar um novo item.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editingReagent ? 'Editar Reagente' : 'Novo Reagente'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSaveReagent} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Reagente</label>
                            <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Ácido Clorídrico" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fórmula Química</label>
                            <input name="formula" value={formData.formula} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: HCl" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CAS Number</label>
                            <input name="casNumber" value={formData.casNumber} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="00-00-0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade</label>
                                <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                    <option value="ML">mL</option>
                                    <option value="L">L</option>
                                    <option value="G">g</option>
                                    <option value="KG">kg</option>
                                    <option value="UNID">un</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd Atual</label>
                                <input type="number" step="0.01" name="quantity" required value={formData.quantity} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Mínimo</label>
                            <input type="number" step="0.01" name="minStockLevel" required value={formData.minStockLevel} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Validade</label>
                            <input type="date" name="expirationDate" required value={formData.expirationDate} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Localização</label>
                            <input name="location" value={formData.location} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Armário 1, Prateleira B" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição / Obs</label>
                            <textarea name="description" rows={2} value={formData.description} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Detalhes adicionais..."></textarea>
                        </div>
                        <div className="col-span-2 flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100 transition-colors">
                             <input type="checkbox" name="isControlled" id="isControlled" checked={formData.isControlled} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 cursor-pointer" />
                            <label htmlFor="isControlled" className="text-sm font-bold text-red-800 cursor-pointer select-none">Este reagente é controlado pela Polícia Federal/Exército</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-transform active:scale-95">{editingReagent ? 'Salvar Alterações' : 'Cadastrar Reagente'}</button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* Modal de Retirada */}
      {withdrawalReagent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Solicitar Retirada</h2>
                            <p className="text-sm text-gray-500">Item: <strong className="text-blue-600">{withdrawalReagent.name}</strong></p>
                        </div>
                        <button onClick={() => setWithdrawalReagent(null)} className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Disponível em Estoque</div>
                            <div className="text-2xl font-bold text-blue-800">{withdrawalReagent.quantity} <span className="text-sm">{withdrawalReagent.unit}</span></div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantidade a Retirar</label>
                            <div className="relative">
                                <input type="number" step="0.01" max={withdrawalReagent.quantity} min="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="0.00" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{withdrawalReagent.unit}</span>
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo da Utilização</label>
                             <textarea required rows={3} value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none" placeholder="Descreva brevemente para que será usado..."></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setWithdrawalReagent(null)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                            <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-md transition-transform active:scale-95">Confirmar Solicitação</button>
                        </div>
                    </form>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};