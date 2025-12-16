import React, { useState, useEffect } from 'react';
import { Reagent, User, WithdrawalRequest, RequestStatus, ReagentCategory } from '../types';
import SearchBar from './SearchBar';
import ReagentList from './ReagentList';
import AddReagentModal from './AddReagentModal';
import { RequestWithdrawalModal } from './RequestWithdrawalModal';
import { getReagents, createReagent } from '../services/api';

interface InventoryProps {
    user: User;
    onDeleteReagent: (id: string) => void; 
    onRequestWithdrawal: (request: WithdrawalRequest) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ user, onDeleteReagent, onRequestWithdrawal }) => {
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [reagentToWithdraw, setReagentToWithdraw] = useState<Reagent | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getReagents();
            
            // --- BLINDAGEM DE ERRO ---
            // Se a API retornar erro ou algo que não é lista, evitamos o crash
            if (!Array.isArray(data)) {
                console.error("A API retornou dados inválidos:", data);
                setReagents([]); 
                return;
            }

            const formattedData = data.map((r: any) => ({
                ...r,
                // Garante compatibilidade entre Backend (minQuantity) e Frontend (minStockLevel)
                minStockLevel: r.minQuantity || r.minStockLevel || 10, 
                
                // Mapeamento dos novos campos (se vier null do banco, usa string vazia)
                casNumber: r.casNumber || '',
                formula: r.formula || '',
                location: r.location || '',

                // Proteção para data: se vier null, usa data atual para não quebrar UI
                expirationDate: r.expirationDate || new Date().toISOString()
            }));

            setReagents(formattedData);
        } catch (error) {
            console.error("Erro ao carregar inventário:", error);
            setReagents([]);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (reagent: Reagent) => {
        if (reagent.quantity === 0) return 'esgotado';
        if (reagent.quantity > 0 && reagent.quantity <= (reagent.minStockLevel || 10)) return 'baixo';
        return 'ok';
    }

    const filteredReagents = reagents.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.formula && r.formula.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.casNumber && r.casNumber.includes(searchTerm));

        const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

        const status = getStockStatus(r);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleAdd = async (newReagentData: Omit<Reagent, 'id' | 'createdAt'>) => {
        try {
            const savedReagent = await createReagent(newReagentData);
            
            const formattedReagent = {
                ...savedReagent,
                minStockLevel: savedReagent.minQuantity || 10,
                casNumber: savedReagent.casNumber || '',
                formula: savedReagent.formula || '',
                location: savedReagent.location || '',
                expirationDate: savedReagent.expirationDate || new Date().toISOString()
            };

            setReagents(prev => [...prev, formattedReagent]);
            setIsAddModalOpen(false);
        } catch (error) {
            alert("Erro ao salvar no banco de dados. Veja o console.");
        }
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

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 animate-pulse">Carregando estoque...</p>
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