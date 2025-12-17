
import React from 'react';
import { User, Reagent, WasteLog, UniversityNews } from '../../../types';

interface DashboardProps {
    user: User;
    reagents: Reagent[];
    wasteLogs: WasteLog[];
    news: UniversityNews[];
    onNavigate: (view: string) => void;
}

const QuickActionButton: React.FC<{ icon: string, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:shadow-lg transition-shadow border ${color}`}>
        <i className={`fa-solid ${icon} text-3xl`}></i>
        <span className="font-semibold text-sm text-center">{label}</span>
    </button>
);


export const Dashboard: React.FC<DashboardProps> = ({ user, reagents, wasteLogs, onNavigate, news }) => {
  const lowStockCount = reagents.filter(r => r.quantity > 0 && r.quantity <= r.minStockLevel).length;
  const controlledCount = reagents.filter(r => r.isControlled).length;
  const totalWaste = wasteLogs.reduce((acc, log) => acc + log.amount, 0); // Note: simplistic sum, units vary
  
  const getCategoryTagColor = (category: UniversityNews['category']) => {
    switch (category) {
        case 'Edital': return 'bg-blue-100 text-blue-800';
        case 'Evento': return 'bg-green-100 text-green-800';
        case 'Aviso': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">Olá, {user.name}! Bem-vindo(a) ao SIRU.</h2>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-primary-500/10 text-primary-600 p-3 rounded-full">
                <i className="fa-solid fa-vials text-2xl"></i>
            </div>
            <div>
                <h3 className="font-semibold text-gray-500">Total de Reagentes</h3>
                <p className="text-3xl font-bold text-gray-800">{reagents.length}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
             <div className="bg-yellow-400/10 text-yellow-600 p-3 rounded-full">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
            </div>
            <div>
                <h3 className="font-semibold text-gray-500">Estoque Baixo</h3>
                <p className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-800'}`}>{lowStockCount}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-tech-500/10 text-tech-500 p-3 rounded-full">
                <i className="fa-solid fa-shield-halved text-2xl"></i>
            </div>
            <div>
                <h3 className="font-semibold text-gray-500">Controlados</h3>
                <p className={`text-3xl font-bold text-gray-800`}>{controlledCount}</p>
            </div>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-secondary-500/10 text-secondary-600 p-3 rounded-full">
                <i className="fa-solid fa-recycle text-2xl"></i>
            </div>
            <div>
                <h3 className="font-semibold text-gray-500">Resíduos Gerados</h3>
                <p className={`text-3xl font-bold text-gray-800`}>{wasteLogs.length}</p>
            </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.role === 'ADMIN' && <QuickActionButton icon="fa-plus" label="Novo Reagente" onClick={() => onNavigate('inventory')} color="border-primary-500 text-primary-600"/>}
              <QuickActionButton icon="fa-dolly" label="Solicitar Retirada" onClick={() => onNavigate('inventory')} color="border-secondary-500 text-secondary-600"/>
              {user.role === 'ADMIN' && <QuickActionButton icon="fa-trash-can" label="Log de Resíduos" onClick={() => onNavigate('waste')} color="border-yellow-500 text-yellow-600"/>}
              <QuickActionButton icon="fa-user-shield" label="Assistente IA" onClick={() => onNavigate('assistant')} color="border-tech-500 text-tech-500"/>
          </div>
      </div>

      {/* NEWS FEED */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-link text-primary-600"></i>
              Conexão Unilab
          </h3>
          <ul className="space-y-3">
              {news.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
                      <div>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-700 hover:text-primary-600">{item.title}</a>
                          <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCategoryTagColor(item.category)}`}>
                          {item.category}
                      </span>
                  </li>
              ))}
          </ul>
      </div>

    </div>
  );
};