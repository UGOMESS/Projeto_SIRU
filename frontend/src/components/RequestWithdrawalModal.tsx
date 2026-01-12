import React, { useState } from 'react';
import { Reagent, User } from '../types';

interface RequestWithdrawalModalProps {
  reagent: Reagent | null;
  user: User;
  onClose: () => void;
  onSubmit: (data: { amount: number; reason: string; usageDate: string; requestedBy: string; }) => void;
}

export const RequestWithdrawalModal: React.FC<RequestWithdrawalModalProps> = ({ reagent, user, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [usageDate, setUsageDate] = useState('');
  const [error, setError] = useState('');

  if (!reagent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestedAmount = parseFloat(amount);

    // Validação de Número
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setError('A quantidade deve ser um número positivo.');
      return;
    }

    // Validação de Estoque
    if (requestedAmount > reagent.quantity) {
      setError(`Quantidade solicitada (${requestedAmount} ${reagent.unit}) excede o estoque disponível (${reagent.quantity} ${reagent.unit}).`);
      return;
    }

    // Validação de Data (Não permite passado)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ajuste de fuso horário para garantir comparação correta do dia
    const selectedDate = new Date(usageDate);
    const userTimezoneOffset = selectedDate.getTimezoneOffset() * 60000;
    const selectedDateLocal = new Date(selectedDate.getTime() + userTimezoneOffset);

    if (selectedDateLocal < today) {
        setError('A data de utilização não pode ser no passado.');
        return;
    }
    
    setError('');
    onSubmit({
      amount: requestedAmount,
      reason: reason,
      usageDate: usageDate,
      requestedBy: user.name,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-flask"></i> Solicitar Reagente
          </h2>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info do Reagente */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-900 text-lg">{reagent.name}</h3>
            <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-blue-600">Estoque Atual:</span>
                <span className="font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {reagent.quantity} {reagent.unit}
                </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade ({reagent.unit}) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="amount" 
                id="amount" 
                value={amount} 
                onChange={(e) => { setAmount(e.target.value); setError(''); }} 
                required 
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                max={reagent.quantity}
                step="any"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="usageDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Uso <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="usageDate" 
                id="usageDate" 
                value={usageDate} 
                onChange={(e) => { setUsageDate(e.target.value); setError(''); }}
                required 
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Justificativa <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="reason" 
              id="reason" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows={3}
              required
              className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Descreva brevemente para qual experimento ou aula este reagente será utilizado..."
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700 flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2">
              <i className="fa-solid fa-paper-plane"></i> Enviar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};