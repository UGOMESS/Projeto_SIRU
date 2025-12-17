
import React from 'react';
import { Reagent } from '../../../types';

export interface BasketItem {
    reagent: Reagent;
    amount: number;
}

interface WithdrawalBasketProps {
    basket: BasketItem[];
    onUpdateAmount: (reagentId: string, amount: number) => void;
    onRemove: (reagentId: string) => void;
    onFinalize: () => void;
}

export const WithdrawalBasket: React.FC<WithdrawalBasketProps> = ({ basket, onUpdateAmount, onRemove, onFinalize }) => {
    if (basket.length === 0) {
        return null; // Don't render anything if the basket is empty
    }

    const totalItems = basket.length;
    const hasInvalidAmount = basket.some(item => item.amount <= 0 || item.amount > item.reagent.quantity);

    return (
        <div className="fixed bottom-4 right-28 z-40 bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Cesta de Solicitação ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</h3>
                 <i className="fa-solid fa-shopping-cart text-gray-600"></i>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto scrollbar-thin space-y-3">
                {basket.map(item => (
                    <div key={item.reagent.id} className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{item.reagent.name}</p>
                            <p className="text-xs text-gray-500">Em estoque: {item.reagent.quantity} {item.reagent.unit}</p>
                        </div>
                        <div className="w-24">
                            <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => onUpdateAmount(item.reagent.id, parseFloat(e.target.value) || 0)}
                                className={`w-full p-1 border rounded-md text-sm ${item.amount > item.reagent.quantity ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Qtd."
                                min="0.01"
                                max={item.reagent.quantity}
                                step="any"
                                aria-label={`Quantidade de ${item.reagent.name}`}
                            />
                        </div>
                        <button onClick={() => onRemove(item.reagent.id)} className="text-red-500 hover:text-red-700" title={`Remover ${item.reagent.name}`}>
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gray-50 border-t">
                <button
                    onClick={onFinalize}
                    className="w-full bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-500 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={hasInvalidAmount}
                >
                    Finalizar Solicitação
                </button>
                {basket.some(item => item.amount <= 0) && <p className="text-xs text-red-600 mt-2 text-center">Todos os itens devem ter uma quantidade maior que zero.</p>}
                {basket.some(item => item.amount > item.reagent.quantity) && <p className="text-xs text-red-600 mt-2 text-center">A quantidade solicitada não pode exceder o estoque.</p>}
            </div>
        </div>
    );
};