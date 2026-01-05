// frontend/src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { User, UniversityNews } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  user: User;
  // news: UniversityNews[]; // REMOVIDO: Agora o dashboard busca suas próprias notícias
  onNavigate: (view: string) => void;
}

// Tipagem do que vem da API de Stats
interface DashboardStats {
  totalReagents: number;
  lowStockReagents: number;
  pendingRequests: number;
  totalWaste: number;
}

const QuickActionButton: React.FC<{ icon: string, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:shadow-lg transition-shadow border ${color} bg-white group`}>
    <i className={`fa-solid ${icon} text-3xl group-hover:scale-110 transition-transform`}></i>
    <span className="font-semibold text-sm text-center text-gray-700">{label}</span>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  // Estado para estatísticas
  const [stats, setStats] = useState<DashboardStats>({
    totalReagents: 0,
    lowStockReagents: 0,
    pendingRequests: 0,
    totalWaste: 0
  });

  // Estado para Notícias (Array vazio inicialmente)
  const [news, setNews] = useState<UniversityNews[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Busca TUDO assim que a tela abre
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Executa as duas requisições em paralelo
        const [statsRes, newsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/news')
        ]);

        setStats(statsRes.data);
        setNews(newsRes.data);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryTagColor = (category: string) => {
    // Adaptação simples caso a categoria venha diferente do esperado
    const cat = category || 'Geral';
    if (cat.includes('Edital')) return 'bg-blue-100 text-blue-800';
    if (cat.includes('Evento')) return 'bg-green-100 text-green-800';
    if (cat.includes('Aviso')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-700">Olá, {user.name}! Bem-vindo(a) ao SIRU.</h2>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total de Reagentes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-blue-500/10 text-blue-600 p-3 rounded-full">
            <i className="fa-solid fa-vials text-2xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-500 text-sm">Total de Reagentes</h3>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? '...' : stats.totalReagents}
            </p>
          </div>
        </div>

        {/* Card 2: Estoque Baixo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 transition hover:shadow-md">
           <div className="bg-yellow-400/10 text-yellow-600 p-3 rounded-full">
            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-500 text-sm">Estoque Baixo</h3>
            <p className={`text-3xl font-bold ${stats.lowStockReagents > 0 ? 'text-yellow-600' : 'text-gray-800'}`}>
              {loading ? '...' : stats.lowStockReagents}
            </p>
          </div>
        </div>

        {/* Card 3: Pedidos Pendentes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-orange-500/10 text-orange-600 p-3 rounded-full">
            <i className="fa-solid fa-clock text-2xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-500 text-sm">Pedidos Pendentes</h3>
            <p className={`text-3xl font-bold ${stats.pendingRequests > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
              {loading ? '...' : stats.pendingRequests}
            </p>
          </div>
        </div>

         {/* Card 4: Resíduos */}
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-green-500/10 text-green-600 p-3 rounded-full">
            <i className="fa-solid fa-recycle text-2xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-500 text-sm">Resíduos (L)</h3>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? '...' : stats.totalWaste}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.role === 'ADMIN' && (
                <QuickActionButton icon="fa-plus" label="Novo Reagente" onClick={() => onNavigate('inventory')} color="border-blue-200 text-blue-600"/>
              )}
              <QuickActionButton icon="fa-dolly" label="Solicitar Retirada" onClick={() => onNavigate('inventory')} color="border-purple-200 text-purple-600"/>
              {user.role === 'ADMIN' && (
                <QuickActionButton icon="fa-trash-can" label="Gestão de Resíduos" onClick={() => onNavigate('waste')} color="border-green-200 text-green-600"/>
              )}
              <QuickActionButton icon="fa-user-shield" label="Assistente IA" onClick={() => onNavigate('assistant')} color="border-indigo-200 text-indigo-600"/>
          </div>
      </div>

      {/* NEWS FEED */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-graduation-cap text-blue-600"></i>
              Conexão Unilab (Ao Vivo)
          </h3>
          <ul className="space-y-3">
              {loading && <p className="text-gray-500 text-sm p-4">Carregando notícias da Unilab...</p>}
              
              {!loading && news.length === 0 && (
                 <p className="text-gray-400 text-sm p-4">Nenhuma notícia encontrada no momento.</p>
              )}

              {news.map((item, index) => (
                  <li key={index} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <div>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">{item.title}</a>
                          <p className="text-xs text-gray-400 mt-1">{item.date}</p>
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