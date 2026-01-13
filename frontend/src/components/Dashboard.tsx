// frontend/src/components/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Reagent } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cores para o gráfico
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [reagentsRes, requestsRes, newsRes] = await Promise.all([
          api.get('/reagents'),
          api.get('/requests'),
          api.get('/news').catch(() => ({ data: [] }))
      ]);

      const reagents: Reagent[] = reagentsRes.data;
      const requests = requestsRes.data;

      // 1. CÁLCULO DINÂMICO DO GRÁFICO (Dados Reais)
      // Agrupa os reagentes pela categoria real cadastrada no banco
      const categoryMap: Record<string, number> = {};
      reagents.forEach(r => {
          const cat = r.category || 'Outros';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      // Transforma em array para o gráfico
      const categoryStats = Object.entries(categoryMap).map(([name, qtd]) => ({
          name, 
          qtd
      }));

      // 2. CÁLCULOS GERAIS
      const lowStock = reagents.filter(r => r.quantity <= (r.minStockLevel || 0)).length;
      
      // Filtros de Pedidos
      const pendingTotal = requests.filter((r: any) => r.status === 'PENDING').length;
      
      const myRequests = requests.filter((r: any) => r.userId === user.id);
      const myPending = myRequests.filter((r: any) => r.status === 'PENDING').length;
      const myApproved = myRequests.filter((r: any) => r.status === 'APPROVED').length;

      setStats({
        totalReagents: reagents.length,
        lowStockReagents: lowStock,
        totalWaste: 0, 
        pendingRequests: pendingTotal, // Visão Admin
        myPending,   // Visão Pesquisador
        myApproved,  // Visão Pesquisador
        categoryStats // Gráfico real
      });

      setNews(newsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
      if (!stats) return "Carregando informações...";

      if (user.role === 'ADMIN') {
          return stats.pendingRequests > 0 
            ? <span>Há <strong className="text-white bg-white/20 px-2 py-0.5 rounded border border-white/30">{stats.pendingRequests} pedidos</strong> aguardando sua aprovação.</span>
            : "Visão geral do SIRU. Todas as operações estão em dia.";
      } else {
          // CORREÇÃO DA MENSAGEM DO PESQUISADOR
          const msgs = [];
          if (stats.myPending > 0) msgs.push(`${stats.myPending} pedidos aguardando aprovação`);
          if (stats.myApproved > 0) msgs.push(`${stats.myApproved} pedidos aguardando retirada`);
          
          if (msgs.length === 0) return "Visão geral do SIRU. Você não tem pedidos ativos no momento.";
          
          return (
            <span>
                Você tem <strong className="text-white bg-white/20 px-2 py-0.5 rounded border border-white/30">{msgs.join(' e ')}</strong>.
            </span>
          );
      }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 animate-pulse font-medium">Sincronizando laboratório...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Banner de Boas-vindas */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Olá, {user.name.split(' ')[0]}!</h2>
              <p className="text-indigo-100 mb-6 max-w-2xl text-lg">
                  {getWelcomeMessage()}
              </p>
              
              <div className="flex flex-wrap gap-3">
                  <button onClick={() => onNavigate('inventory')} className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-bold shadow-lg hover:bg-indigo-50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                      <i className="fa-solid fa-flask"></i> Acessar Estoque
                  </button>
                  {user.role === 'ADMIN' ? (
                      <button onClick={() => onNavigate('waste')} className="bg-indigo-800/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-bold shadow-lg hover:bg-indigo-800/70 transition-all border border-indigo-400/30 flex items-center gap-2">
                          <i className="fa-solid fa-recycle"></i> Gestão de Resíduos
                      </button>
                  ) : (
                      <button onClick={() => onNavigate('my-requests')} className="bg-indigo-800/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-bold shadow-lg hover:bg-indigo-800/70 transition-all border border-indigo-400/30 flex items-center gap-2">
                          <i className="fa-solid fa-clipboard-list"></i> Meus Pedidos
                      </button>
                  )}
              </div>
          </div>
          <i className="fa-solid fa-atom absolute -bottom-10 -right-10 text-[180px] opacity-10 rotate-12 text-white"></i>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                  <i className="fa-solid fa-vials"></i>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Itens</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats?.totalReagents || 0}</h3>
              </div>
          </div>

          <div onClick={() => onNavigate('inventory')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl group-hover:bg-red-100 transition-colors">
                  <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-red-500">Estoque Crítico</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats?.lowStockReagents || 0}</h3>
              </div>
          </div>

          <div onClick={() => onNavigate(user.role === 'ADMIN' ? 'withdrawals' : 'my-requests')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl group-hover:bg-yellow-100 transition-colors">
                  <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-yellow-600">
                    {user.role === 'ADMIN' ? 'Pendências' : 'Meus Pedidos'}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {user.role === 'ADMIN' ? (stats?.pendingRequests || 0) : (stats?.myPending + stats?.myApproved || 0)}
                  </h3>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xl">
                  <i className="fa-solid fa-dumpster"></i>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resíduos (L)</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats?.totalWaste || 0}</h3>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfico de Rosca (DADOS REAIS AGORA) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-lg">Composição do Estoque</h3>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Por categoria real</span>
              </div>
              
              <div className="h-72 w-full flex items-center justify-center">
                  {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.categoryStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="qtd"
                                stroke="none"
                            >
                                {stats.categoryStats.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                                itemStyle={{color: '#374151', fontWeight: 600}}
                            />
                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400 flex flex-col items-center">
                        <i className="fa-solid fa-chart-pie text-4xl mb-2 opacity-30"></i>
                        <p>Sem dados suficientes para o gráfico</p>
                    </div>
                  )}
              </div>
          </div>

          {/* Lista de Alertas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-bell text-gray-400"></i> Atenção Requerida
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[300px] scrollbar-thin">
                  {stats?.lowStockReagents > 0 ? (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center gap-2 mb-1">
                              <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                              <h4 className="font-bold text-red-800 text-sm">Reposição Necessária</h4>
                          </div>
                          <p className="text-xs text-red-600 leading-relaxed">
                              Existem <strong>{stats.lowStockReagents} reagentes</strong> abaixo do nível mínimo.
                          </p>
                          <button onClick={() => onNavigate('inventory')} className="mt-3 text-xs font-bold text-red-700 hover:text-red-900 hover:underline">
                              Ver lista de reposição →
                          </button>
                      </div>
                  ) : (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center py-8">
                          <i className="fa-solid fa-check-circle text-green-500 text-3xl mb-2"></i>
                          <p className="text-sm font-bold text-green-800">Estoque Saudável</p>
                      </div>
                  )}

                  {/* Alerta de Pedidos para ADMIN */}
                  {user.role === 'ADMIN' && stats?.pendingRequests > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-center gap-2 mb-1">
                              <i className="fa-solid fa-hourglass-half text-yellow-600"></i>
                              <h4 className="font-bold text-yellow-800 text-sm">Aprovações Pendentes</h4>
                          </div>
                          <p className="text-xs text-yellow-700">
                              {stats.pendingRequests} solicitações aguardam liberação.
                          </p>
                          <button onClick={() => onNavigate('withdrawals')} className="mt-3 text-xs font-bold text-yellow-800 hover:underline">
                              Resolver agora →
                          </button>
                      </div>
                  )}

                  {/* Alerta de Retirada para PESQUISADOR */}
                   {user.role !== 'ADMIN' && stats?.myApproved > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 mb-1">
                              <i className="fa-solid fa-box-open text-green-600"></i>
                              <h4 className="font-bold text-green-800 text-sm">Pronto para Retirada</h4>
                          </div>
                          <p className="text-xs text-green-700">
                              Você tem {stats.myApproved} itens aprovados prontos para buscar.
                          </p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};