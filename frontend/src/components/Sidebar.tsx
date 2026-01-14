import React, { useState } from 'react';
import { User, Reagent } from '../types';

interface SidebarProps {
  activeView: string;
  setView: (view: string) => void;
  user: User;
  onToggleRole: () => void; 
  isCollapsed: boolean;
  toggleSidebar: () => void;
  reagents: Reagent[];
  onLogout: () => void;
}

// --- SUB-COMPONENTE: Gaveta de Alertas ---
const AlertsDrawer: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    lowStockReagents: Reagent[];
    recentlyAddedReagents: Reagent[];
}> = ({ isOpen, onClose, lowStockReagents, recentlyAddedReagents }) => (
    <>
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
        <div className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out w-80 ${isOpen ? 'transform-none' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <i className="fa-solid fa-bell text-blue-600"></i> Alertas e Informes
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <i className="fa-solid fa-triangle-exclamation text-orange-500"></i>
                        Estoque Baixo
                    </h3>
                    {lowStockReagents.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {lowStockReagents.map(r => (
                                <li key={r.id} className="flex justify-between items-center p-3 rounded-lg bg-orange-50 border border-orange-100 text-orange-800">
                                    <span className="font-medium truncate pr-2">{r.name}</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-orange-200 text-xs font-bold whitespace-nowrap">
                                        {r.quantity} {r.unit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded border border-dashed border-gray-200">
                            Estoque saudável.
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
                        Recentes
                    </h3>
                    {recentlyAddedReagents.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {recentlyAddedReagents.map(r => (
                                <li key={r.id} className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800">
                                    <span className="font-medium truncate pr-2">{r.name}</span>
                                    <span className="text-xs opacity-70 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Nenhum histórico recente.</p>
                    )}
                </div>
            </div>
        </div>
    </>
);

// --- SUB-COMPONENTE: Modal de Confirmação de Logout ---
const LogoutConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <i className="fa-solid fa-right-from-bracket text-3xl pl-1"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Sair do Sistema?</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Você será desconectado da sua conta.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition-colors">
                            Sim, Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, 
    setView, 
    user, 
    isCollapsed, 
    toggleSidebar, 
    reagents,
    onLogout 
}) => {
  const [isSystemsOpen, setIsSystemsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  
  const lowStockReagents = reagents.filter(r => r.quantity > 0 && r.quantity <= (r.minStockLevel || 0));
  const lowStockCount = lowStockReagents.length;

  const recentlyAddedReagents = [...reagents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Itens do dia a dia (Operacionais)
  const operationalItems = [
    { id: 'dashboard', name: 'Visão Geral', icon: 'fa-chart-pie' }, 
    { id: 'inventory', name: 'Estoque', icon: 'fa-flask' },
    { id: 'my-requests', name: 'Meus Pedidos', icon: 'fa-clipboard-list' }, 
    { id: 'withdrawals', name: 'Central de Pedidos', icon: 'fa-dolly', adminOnly: true },
    { id: 'waste', name: 'Resíduos', icon: 'fa-recycle', adminOnly: true },
  ];
  
  const systemLinks = [
      { name: 'Portal Unilab', href: 'https://unilab.edu.br/' },
      { name: 'SIGAA', href: 'https://sig.unilab.edu.br/sigaa/' },
      { name: 'SEI', href: 'https://sei.unilab.edu.br/' },
      { name: 'Biblioteca', href: 'https://bibweb.unilab.edu.br/' },
  ];

  return (
    <>
    <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
            setShowLogoutModal(false);
            onLogout();
        }}
    />

    <aside className={`fixed top-0 left-0 h-full bg-blue-900 text-white transition-all duration-300 ease-in-out z-30 flex flex-col shadow-xl ${isCollapsed ? 'w-20' : 'w-72'}`}>
        
        <div className="flex items-center justify-between h-[80px] px-4 border-b border-blue-800 flex-shrink-0 bg-blue-950">
            <div className={`flex items-center gap-2 overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <i className="fa-solid fa-atom fa-spin-pulse text-green-400 text-xl"></i>
                <span className="font-bold text-lg tracking-wide">LabManager</span>
            </div>
            <button onClick={toggleSidebar} className="text-blue-300 hover:text-white p-2 focus:outline-none transition-colors">
                <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'} text-xl`}></i>
            </button>
        </div>
        
        <nav className="flex-grow p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700">
            <ul className="space-y-1">
                {/* Renderiza Itens Operacionais */}
                {operationalItems.map(item => {
                    if (item.adminOnly && user.role !== 'ADMIN') return null;
                    return (
                        <li key={item.id}>
                            <button 
                                onClick={() => setView(item.id)}
                                title={isCollapsed ? item.name : ''}
                                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeView === item.id ? 'bg-green-600 text-white shadow-md' : 'hover:bg-blue-800 text-blue-100 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <i className={`fa-solid ${item.icon} w-6 text-center text-lg`}></i>
                                {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
                            </button>
                        </li>
                    )
                })}
                
                <div className="my-2 border-t border-blue-800/50"></div>

                {/* Seção de Sistemas Unilab */}
                <li key="systems-accordion">
                    <button 
                        onClick={() => setIsSystemsOpen(!isSystemsOpen)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-blue-800 text-blue-200 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="flex items-center">
                            <i className={`fa-solid fa-layer-group w-6 text-center text-lg`}></i>
                            {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Sistemas Unilab</span>}
                        </div>
                        {!isCollapsed && <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isSystemsOpen ? 'rotate-180' : ''}`}></i>}
                    </button>
                    
                    {isSystemsOpen && !isCollapsed && (
                        <ul className="pl-12 py-1 bg-blue-950/30 rounded-lg mb-2 mx-2 space-y-1">
                            {systemLinks.map(link => (
                                <li key={link.name}>
                                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center py-2 text-xs hover:text-green-400 text-blue-300 transition-colors">
                                        <i className="fa-solid fa-arrow-up-right-from-square mr-2 opacity-50"></i>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>

                {/* Item de Alertas */}
                <li key='alerts'>
                    <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className={`w-full relative flex items-center p-3 rounded-lg transition-colors hover:bg-blue-800 text-blue-200 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <i className={`fa-solid fa-bell w-6 text-center text-lg`}></i>
                        {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Alertas</span>}
                        
                        {lowStockCount > 0 && (
                            <span className={`absolute ${isCollapsed ? 'top-2 right-2 h-3 w-3 p-0' : 'top-3 right-3 px-1.5 py-0.5'} rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm flex items-center justify-center animate-pulse`}>
                                {!isCollapsed && lowStockCount}
                            </span>
                        )}
                    </button>
                </li>

                {/* 1) NOVO POSICIONAMENTO: GESTÃO DE USUÁRIOS (ADMIN APENAS) */}
                {user.role === 'ADMIN' && (
                    <li key='users' className="mt-2">
                        <button 
                            onClick={() => setView('users')}
                            title={isCollapsed ? 'Gestão de Usuários' : ''}
                            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeView === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-blue-800 text-blue-100 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <i className="fa-solid fa-users-gear w-6 text-center text-lg"></i>
                            {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Gerenciar Usuários</span>}
                        </button>
                    </li>
                )}
            </ul>
        </nav>

        <div className="p-4 border-t border-blue-800 bg-blue-950/50 space-y-2">
            <button 
              onClick={() => setView('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Minha Conta"
            >
              <i className="fa-solid fa-user-gear w-6 text-center text-lg"></i>
              <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Minha Conta</span>
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)} 
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-300 bg-red-900/20 border border-red-900/30 rounded-lg hover:bg-red-900/40 hover:text-red-200 transition-colors ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Sair do Sistema"
            >
              <i className="fa-solid fa-right-from-bracket w-6 text-center text-lg"></i>
              <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Sair</span>
            </button>
        </div>
    </aside>

    <AlertsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        lowStockReagents={lowStockReagents}
        recentlyAddedReagents={recentlyAddedReagents}
    />
    </>
  );
};