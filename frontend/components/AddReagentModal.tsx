
import React, { useState } from 'react';
// FIX: Import `ReagentCategory` and `Unit` enums to provide values for the form and ensure type safety.
import { type Reagent, ReagentCategory, Unit } from '../types';

interface AddReagentModalProps {
  onClose: () => void;
  onAdd: (reagent: Omit<Reagent, 'id' | 'createdAt'>) => void;
}

export default function AddReagentModal({ onClose, onAdd }: AddReagentModalProps) {
  // FIX: Expand form state to include all required `Reagent` properties (`category`, `isControlled`, `minStockLevel`) to prevent type errors on submission.
  const [formData, setFormData] = useState({
    name: '',
    formula: '',
    quantity: '',
    unit: Unit.ML,
    location: '',
    casNumber: '',
    expiryDate: '',
    category: ReagentCategory.ACID,
    isControlled: false,
    minStockLevel: '',
  });

  // FIX: Enhance `handleChange` to correctly handle state updates for checkbox inputs (`isControlled`).
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // FIX: Ensure all numeric fields (`quantity`, `minStockLevel`) are correctly parsed from strings to numbers before submission.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      minStockLevel: Number(formData.minStockLevel) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Adicionar Novo Reagente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Reagente</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="formula" className="block text-sm font-medium text-gray-700">Fórmula Química</label>
            <input type="text" name="formula" id="formula" value={formData.formula} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
          </div>
          {/* FIX: Add a select input for the `category` field, which was missing from the form. */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm">
              {Object.values(ReagentCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantidade</label>
              <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidade</label>
              {/* FIX: Use `Unit` enum values for the select options to ensure consistency with the type definition. */}
              <select name="unit" id="unit" value={formData.unit} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm">
                <option value={Unit.ML}>mL</option>
                <option value={Unit.L}>L</option>
                <option value={Unit.G}>g</option>
                <option value={Unit.KG}>kg</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localização</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
          </div>
          {/* FIX: Add an input for the `minStockLevel` field, which was missing from the form. */}
          <div>
              <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">Nível Mínimo de Estoque</label>
              <input type="number" name="minStockLevel" id="minStockLevel" value={formData.minStockLevel} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="casNumber" className="block text-sm font-medium text-gray-700">Número CAS</label>
            <input type="text" name="casNumber" id="casNumber" value={formData.casNumber} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Data de Validade</label>
            <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-unilab-blue focus:border-unilab-blue sm:text-sm"/>
          </div>
          {/* FIX: Add a checkbox for the boolean `isControlled` field, which was missing from the form. */}
          <div className="flex items-center">
            <input type="checkbox" name="isControlled" id="isControlled" checked={formData.isControlled} onChange={handleChange} className="h-4 w-4 text-unilab-blue border-gray-300 rounded focus:ring-unilab-blue"/>
            <label htmlFor="isControlled" className="ml-2 block text-sm text-gray-900">Controlado (Exige autorização especial)</label>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
            <button type="submit" className="bg-unilab-blue text-white px-4 py-2 rounded-md hover:bg-unilab-green font-semibold">Salvar Reagente</button>
          </div>
        </form>
      </div>
    </div>
  );
}