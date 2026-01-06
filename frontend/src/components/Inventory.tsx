// frontend/src/components/Inventory.tsx
import React, { useState } from 'react';
// CORREÇÃO 1: Importar RequestStatus aqui
import { Reagent, User, WithdrawalRequest, RequestStatus } from '../types';

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
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawReason, setWithdrawReason] = useState('');

  // --- Estado do Formulário ---
  const initialFormState = {
    name: '',
    casNumber: '',
    category: 'Outros',
    description: '',
    formula: '',
    quantity: 0,
    unit: 'ML',
    minStockLevel: 10,
    location: '',
    expirationDate: '',
    isControlled: false
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Listas Auxiliares ---
  const categories = ['Todos', 'Ácidos', 'Bases', 'Sais', 'Solventes', 'Outros'];
  const formCategories = ['Ácidos', 'Bases', 'Sais', 'Solventes', 'Outros'];

  // --- Lógica de Filtro ---
  const filteredReagents = reagents.filter(reagent => {
    const matchesSearch = reagent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (reagent.casNumber && reagent.casNumber.includes(searchTerm)) ||
                          (reagent.formula && reagent.formula.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || reagent.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // --- Handlers do Formulário (Adicionar/Editar) ---
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
      quantity: reagent.quantity,
      unit: reagent.unit,
      minStockLevel: reagent.minStockLevel,
      location: reagent.location || '',
      expirationDate: reagent.expirationDate ? new Date(reagent.expirationDate).toISOString().split('T')[0] : '',
      isControlled: reagent.isControlled
    });
    setIsModalOpen(true);
  };

  const handleSaveReagent = (e: React.FormEvent) => {
    e.preventDefault();
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
      setWithdrawAmount(0);
      setWithdrawReason('');
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
     e.preventDefault();
     if (!withdrawalReagent) return;

     const newRequest: WithdrawalRequest = {
         id: '',
         reagentId: withdrawalReagent.id,
         reagentName: withdrawalReagent.name,
         amount: Number(withdrawAmount),
         unit: withdrawalReagent.unit,
         requestedAt: new Date().toISOString(),
         // CORREÇÃO 2: Usar o Enum RequestStatus.PENDING
         status: RequestStatus.PENDING,
         reason: withdrawReason,
         requestedBy: user.name,
     };
     
     onRequestWithdrawal(newRequest);
     setWithdrawalReagent(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Barra de Ferramentas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-search"></i>
            </span>
            <input
              type="text"
              placeholder="Buscar por nome, CAS ou fórmula..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-unilab-blue outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unilab-blue outline-none bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'Todos' ? 'Todas Categorias' : cat}</option>
            ))}
          </select>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium whitespace-nowrap"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Adicionar Reagente</span>
          </button>
        )}
      </div>

      {/* Tabela de Reagentes */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reagente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fórmula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReagents.length > 0 ? (
                filteredReagents.map((reagent) => (
                  <tr key={reagent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{reagent.name}</span>
                        {reagent.description && (
                            <span className="text-xs text-gray-500 italic truncate max-w-xs" title={reagent.description}>
                                {reagent.description}
                            </span>
                        )}
                        {reagent.isControlled && (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 w-fit mt-1">
                             Controlado
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {reagent.formula || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                         {reagent.category}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reagent.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${reagent.quantity <= reagent.minStockLevel ? 'text-red-600' : 'text-green-600'}`}>
                            {reagent.quantity} {reagent.unit}
                        </div>
                        <div className="text-xs text-gray-400">Mín: {reagent.minStockLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {new Date(reagent.expirationDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                            <button onClick={() => openWithdrawModal(reagent)} className="text-purple-600 hover:text-purple-900" title="Solicitar Retirada">
                                <i className="fa-solid fa-dolly"></i>
                            </button>
                            {user.role === 'ADMIN' && (
                                <>
                                    <button onClick={() => openEditModal(reagent)} className="text-blue-600 hover:text-blue-900" title="Editar">
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button onClick={() => onDeleteReagent(reagent.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </>
                            )}
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <i className="fa-solid fa-flask text-4xl text-gray-300"></i>
                      <p>Nenhum reagente encontrado.</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">{editingReagent ? 'Editar Reagente' : 'Novo Reagente'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <form onSubmit={handleSaveReagent} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula</label>
                            <input name="formula" value={formData.formula} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CAS Number</label>
                            <input name="casNumber" value={formData.casNumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                            <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="ML">ml</option>
                                <option value="L">L</option>
                                <option value="G">g</option>
                                <option value="KG">kg</option>
                                <option value="UNID">un</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                            <input type="number" step="0.01" name="quantity" required value={formData.quantity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                            <input type="number" step="0.01" name="minStockLevel" required value={formData.minStockLevel} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                            <input type="date" name="expirationDate" required value={formData.expirationDate} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                            <input name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea name="description" rows={2} value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Detalhes opcionais..."></textarea>
                        </div>
                        <div className="col-span-2 flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                             <input type="checkbox" name="isControlled" id="isControlled" checked={formData.isControlled} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                            <label htmlFor="isControlled" className="text-sm font-medium text-red-800 cursor-pointer">Reagente Controlado</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm">{editingReagent ? 'Salvar' : 'Cadastrar'}</button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* Modal de Retirada */}
      {withdrawalReagent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
                 <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Solicitar Retirada</h2>
                    <p className="text-gray-600 mb-4">Item: <strong className="text-blue-600">{withdrawalReagent.name}</strong></p>
                    <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade ({withdrawalReagent.unit})</label>
                            <input type="number" step="0.01" max={withdrawalReagent.quantity} min="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-lg font-bold" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                             <textarea required rows={2} value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Aula Prática..."></textarea>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setWithdrawalReagent(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 shadow-sm">Solicitar</button>
                        </div>
                    </form>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};