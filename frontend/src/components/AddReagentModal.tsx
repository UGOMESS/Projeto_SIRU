// frontend/src/components/AddReagentModal.tsx

import React, { useState, useEffect } from 'react';
import { Reagent } from '../types';

// Definindo categorias caso não venham do types
const CATEGORIES = [
  'Reagentes Químicos',
  'Solventes',
  'Ácidos',
  'Bases',
  'Sais',
  'Vidrarias',
  'Outros'
];

interface AddReagentModalProps {
    onClose: () => void;
    onAdd: (reagent: any) => void; 
    // Props opcionais para edição
    initialData?: Reagent;
    isEditing?: boolean;
    isOpen: boolean; // Adicionei isOpen para manter o padrão dos outros modais
}

export const AddReagentModal: React.FC<AddReagentModalProps> = ({ 
    onClose, 
    onAdd, 
    initialData, 
    isEditing = false,
    isOpen 
}) => {
    
    // Se não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    // Função auxiliar para data
    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        return isoString.split('T')[0];
    };

    // --- ESTADOS ---
    // Inicializa com dados se for edição, ou vazio se for criação
    const [name, setName] = useState(initialData?.name || '');
    const [category, setCategory] = useState(initialData?.category || 'Reagentes Químicos');
    const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '');
    const [unit, setUnit] = useState(initialData?.unit || 'ML');
    const [expirationDate, setExpirationDate] = useState(formatDate(initialData?.expirationDate) || '');

    // Campos Opcionais
    const [casNumber, setCasNumber] = useState(initialData?.casNumber || '');
    const [formula, setFormula] = useState(initialData?.formula || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [description, setDescription] = useState(initialData?.description || ''); 
    
    // Tratamento de legado (minStockLevel vs minQuantity)
    const [minStockLevel, setMinStockLevel] = useState(
        initialData?.minStockLevel?.toString() || 
        (initialData as any)?.minQuantity?.toString() || 
        '10'
    );
    const [isControlled, setIsControlled] = useState(initialData?.isControlled || false);

    // Efeito para atualizar o formulário se initialData mudar (ex: ao clicar em editar outro item)
    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setCategory(initialData.category || 'Reagentes Químicos');
            setQuantity(initialData.quantity.toString());
            setUnit(initialData.unit);
            setExpirationDate(formatDate(initialData.expirationDate));
            setCasNumber(initialData.casNumber || '');
            setFormula(initialData.formula || '');
            setLocation(initialData.location || '');
            setDescription(initialData.description || '');
            setMinStockLevel(initialData.minStockLevel?.toString() || (initialData as any).minQuantity?.toString() || '10');
            setIsControlled(initialData.isControlled || false);
        } else if (isOpen && !isEditing) {
            // Limpa formulário se for criar novo
            setName(''); setCategory('Reagentes Químicos'); setQuantity(''); 
            setExpirationDate(''); setCasNumber(''); setFormula(''); setLocation(''); 
            setDescription(''); setIsControlled(false);
        }
    }, [isOpen, initialData, isEditing]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        onAdd({
            // Se for edição, precisamos mandar o ID de volta
            id: isEditing ? initialData?.id : undefined, 
            name,
            category,
            quantity: Number(quantity),
            unit,
            minStockLevel: Number(minStockLevel),
            expirationDate, 
            isControlled,
            casNumber,
            formula,
            location,
            description
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Cabeçalho */}
                <div className={`px-6 py-4 flex justify-between items-center ${isEditing ? 'bg-orange-600' : 'bg-blue-600'}`}>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {isEditing ? <><i className="fa-solid fa-pen-to-square"></i> Editar Reagente</> : <><i className="fa-solid fa-flask"></i> Novo Reagente</>}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold transition-colors">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* Linha 1: Nome e CAS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nome do Reagente <span className="text-red-500">*</span></label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 outline-none" placeholder="Ex: Ácido Sulfúrico" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número CAS</label>
                            <input type="text" value={casNumber} onChange={e => setCasNumber(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2 outline-none" placeholder="000-00-0" />
                        </div>
                    </div>

                    {/* Linha 2: Fórmula e Localização */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fórmula Química</label>
                            <input type="text" value={formula} onChange={e => setFormula(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2 outline-none" placeholder="Ex: H2SO4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Localização Física</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2 outline-none" placeholder="Ex: Armário 2, Prat. A" />
                        </div>
                    </div>

                    {/* Linha 3: Categoria e Validade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 p-2 outline-none">
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Validade <span className="text-red-500">*</span></label>
                            <input type="date" required value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2 outline-none" />
                        </div>
                    </div>

                    {/* Bloco de Estoque */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Controle de Estoque</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Qtd. Inicial <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" required value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Unidade</label>
                                <select value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 bg-white p-2 outline-none">
                                    <option value="ML">ML</option>
                                    <option value="L">Litros</option>
                                    <option value="G">Gramas</option>
                                    <option value="KG">Quilos</option>
                                    <option value="UNID">Unidade</option>
                                    <option value="CX">Caixa</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Estoque Mín.</label>
                                <input type="number" value={minStockLevel} onChange={e => setMinStockLevel(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição / Observações</label>
                        <textarea 
                            rows={3} 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 p-2 outline-none" 
                            placeholder="Detalhes adicionais, pureza, marca, toxicidade..."
                        />
                    </div>

                    <div className="flex items-center bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <input type="checkbox" id="controlled" checked={isControlled} onChange={e => setIsControlled(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="controlled" className="ml-2 block text-sm text-gray-900 font-medium cursor-pointer">
                            Substância Controlada (Polícia Federal/Exército)
                        </label>
                    </div>

                </form>

                {/* Rodapé Fixo */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                    <button 
                        onClick={handleSubmit}
                        type="button" // Mudamos para button e chamamos handleSubmit no onClick para garantir submissão fora do form se necessário
                        className={`px-6 py-2 text-white rounded-lg font-bold shadow-sm transition-transform active:scale-95 ${isEditing ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isEditing ? 'Salvar Alterações' : 'Adicionar Reagente'}
                    </button>
                </div>
            </div>
        </div>
    );
}