import React, { useState, useMemo } from 'react';
import { Reagent, User, WithdrawalRequest, RequestStatus, ReagentCategory } from '../types';
import SearchBar from './SearchBar';
import ReagentList from './ReagentList';
import AddReagentModal from './AddReagentModal';
import { RequestWithdrawalModal } from './RequestWithdrawalModal';

interface InventoryProps {
    user: User;
    // Agora recebemos a lista e a função de adicionar do Pai (App.tsx)
    reagents: Reagent[]; 
    onAddReagent: (reagent: Reagent) => void;
    onDeleteReagent: (id: string) => void; 
    onRequestWithdrawal: (request: WithdrawalRequest) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
    user, 
    reagents, // <--- Lista que vem do App.tsx (sempre atualizada)
    onAddReagent, 
    onDeleteReagent, 
    onRequestWithdrawal 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [reagentToWithdraw, setReagentToWithdraw] = useState<Reagent | null>(null);

    // --- NORMALIZAÇÃO DE DADOS ---
    // Garante que os dados vindos do App tenham os campos certos (compatibilidade minQuantity vs minStockLevel)
    const normalizedReagents = useMemo(() => {
        return reagents.map((r: any) => ({
            ...r,
            minStockLevel: r.minQuantity || r.minStockLevel || 10,
            casNumber: r.casNumber || '',
            formula: r.formula || '',
            location: r.location || '',
            expirationDate: r.expirationDate || new Date().toISOString()
        }));
    }, [reagents]);

    const getStockStatus = (reagent: Reagent) => {
        if (reagent.quantity === 0) return 'esgotado';
        if (reagent.quantity > 0 && reagent.quantity <= (reagent.minStockLevel || 10)) return 'baixo';
        return 'ok';
    }

    const filteredReagents = normalizedReagents.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.formula && r.formula.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.casNumber && r.casNumber.includes(searchTerm));

        const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

        const status = getStockStatus(r);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleAdd = (newReagentData: Omit<Reagent, 'id' | 'createdAt'>) => {
        // Cria um objeto completo temporário para passar pro Pai
        // O Pai (App.tsx) vai mandar pro banco e o banco vai corrigir o ID e Data
        const tempReagent: Reagent = {
            ...newReagentData,
            id: 'temp-' + Date.now(),
            createdAt: new Date().toISOString()
        };
        
        // Chama a função do App.tsx
        onAddReagent(tempReagent);
        setIsAddModalOpen(false);
    }
    
    const handleOpenWithdrawalModal = (reagent: Reagent) => {
        setReagentToWithdraw(reagent);
    };

    const handleCloseWithdrawalModal = () => {
        setReagentToWithdraw(null);
    };

    const handleSubmitWithdrawal = (data: { amount: number; reason: string; usageDate: string; requestedBy: string; }) => {
        if (!reagentToWithdraw) return;

        const newRequest: WithdrawalRequest = {
            id: `w${Date.now()}`,
            reagentId: reagentToWithdraw.id,
            reagentName: reagentToWithdraw.name,
            amount: data.amount,
            unit: reagentToWithdraw.unit,
            requestedAt: new Date().toISOString(),
            status: RequestStatus.PENDING,
            reason: data.reason,
            usageDate: data.usageDate,
            requestedBy: data.requestedBy,
        };
        onRequestWithdrawal(newRequest);
        handleCloseWithdrawalModal();
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-grow">
                    <SearchBar onSearch={setSearchTerm} />
                    <select 
                        aria-label="Filtrar por categoria"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"
                    >
                        <option value="all">Todas as Categorias</option>
                        {Object.values(ReagentCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select 
                         aria-label="Filtrar por status do estoque"
                         value={statusFilter}
                         onChange={e => setStatusFilter(e.target.value)}
                         className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="ok">OK</option>
                        <option value="baixo">Estoque Baixo</option>
                        <option value="esgotado">Esgotado</option>
                    </select>
                </div>
                {user.role === 'ADMIN' && (
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-unilab-blue text-white px-4 py-2 rounded-md hover:bg-unilab-green font-semibold flex items-center gap-2 w-full md:w-auto justify-center flex-shrink-0">
                       <span>+</span> Adicionar Reagente
                    </button>
                )}
            </div>

            {reagents.length === 0 && filteredReagents.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">Nenhum reagente encontrado no estoque.</p>
                </div>
            ) : (
                <ReagentList 
                    reagents={filteredReagents} 
                    onDelete={onDeleteReagent} 
                    user={user}
                    onOpenWithdrawalModal={handleOpenWithdrawalModal} 
                />
            )}

            {isAddModalOpen && <AddReagentModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} />}
            {reagentToWithdraw && (
                <RequestWithdrawalModal 
                    reagent={reagentToWithdraw}
                    user={user}
                    onClose={handleCloseWithdrawalModal}
                    onSubmit={handleSubmitWithdrawal}
                />
            )}
        </div>
    );
};