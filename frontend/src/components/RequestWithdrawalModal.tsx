
import React, { useState } from 'react';
import { Reagent, User } from '../../../types';

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

    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setError('A quantidade deve ser um número positivo.');
      return;
    }
    if (requestedAmount > reagent.quantity) {
      setError(`Quantidade solicitada (${requestedAmount} ${reagent.unit}) excede o estoque disponível (${reagent.quantity} ${reagent.unit}).`);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Solicitar Retirada de Reagente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800">{reagent.name}</h3>
            <p className="text-sm text-gray-500">Estoque disponível: {reagent.quantity} {reagent.unit}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Quantidade ({reagent.unit})</label>
              <input 
                type="number" 
                name="amount" 
                id="amount" 
                value={amount} 
                onChange={(e) => { setAmount(e.target.value); setError(''); }} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                max={reagent.quantity}
                step="any"
              />
            </div>
            <div>
              <label htmlFor="usageDate" className="block text-sm font-medium text-gray-700">Data de Utilização</label>
              <input 
                type="date" 
                name="usageDate" 
                id="usageDate" 
                value={usageDate} 
                onChange={(e) => { setUsageDate(e.target.value); setError(''); }}
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Justificativa de Uso</label>
            <textarea 
              name="reason" 
              id="reason" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows={3}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Preparo de soluções para a aula de Química Analítica..."
            />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">
              Cancelar
            </button>
            <button type="submit" className="bg-secondary-600 text-white px-4 py-2 rounded-md hover:bg-secondary-500 font-semibold">
              Enviar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
