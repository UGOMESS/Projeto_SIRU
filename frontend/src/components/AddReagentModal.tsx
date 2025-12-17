import React, { useState } from 'react';
import { Reagent, ReagentCategory } from '../types';

interface AddReagentModalProps {
    onClose: () => void;
    onAdd: (reagent: Omit<Reagent, 'id' | 'createdAt'>) => void;
}

export default function AddReagentModal({ onClose, onAdd }: AddReagentModalProps) {
    // Campos Obrigatórios
    const [name, setName] = useState('');
    const [category, setCategory] = useState<ReagentCategory>(ReagentCategory.SOLVENT);
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('ML');
    const [expirationDate, setExpirationDate] = useState('');

    // Campos Opcionais
    const [casNumber, setCasNumber] = useState('');
    const [formula, setFormula] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState(''); // <--- NOVO STATE
    
    // Configurações
    const [minStockLevel, setMinStockLevel] = useState('10');
    const [isControlled, setIsControlled] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação básica
        if (!name || !quantity || !expirationDate) {
            alert("Preencha os campos obrigatórios!");
            return;
        }

        onAdd({
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
            description // <--- Enviando a descrição
        } as any);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Novo Reagente</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Linha 1: Nome e CAS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nome do Reagente *</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="Ex: Ácido Sulfúrico" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número CAS</label>
                            <input type="text" value={casNumber} onChange={e => setCasNumber(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="000-00-0" />
                        </div>
                    </div>

                    {/* Linha 2: Fórmula e Localização */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fórmula Química</label>
                            <input type="text" value={formula} onChange={e => setFormula(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="Ex: H2SO4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Localização Física</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="Ex: Armário 2, Prat. A" />
                        </div>
                    </div>

                    {/* --- NOVA LINHA: Descrição --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição / Observações</label>
                        <textarea 
                            rows={2} 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" 
                            placeholder="Detalhes adicionais, pureza, marca, etc..."
                        />
                    </div>
                    {/* ----------------------------- */}

                    {/* Linha 3: Categoria e Validade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value as ReagentCategory)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                                {Object.values(ReagentCategory).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Validade *</label>
                            <input 
                                type="date" 
                                required 
                                value={expirationDate} 
                                onChange={e => setExpirationDate(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" 
                            />
                        </div>
                    </div>

                    {/* Linha 4: Quantidade e Unidade */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Qtd. Inicial *</label>
                            <input type="number" step="0.01" required value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Unidade</label>
                            <select value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                                <option value="ML">ML (Mililitros)</option>
                                <option value="L">L (Litros)</option>
                                <option value="G">G (Gramas)</option>
                                <option value="KG">KG (Quilos)</option>
                                <option value="UNID">UNID (Unidades)</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Estoque Mín.</label>
                            <input type="number" value={minStockLevel} onChange={e => setMinStockLevel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                    </div>

                    <div className="flex items-center mt-2">
                        <input type="checkbox" id="controlled" checked={isControlled} onChange={e => setIsControlled(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="controlled" className="ml-2 block text-sm text-gray-900">
                            Substância Controlada (Polícia Federal/Exército)
                        </label>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">Salvar Reagente</button>
                    </div>
                </form>
            </div>
        </div>
    );
}