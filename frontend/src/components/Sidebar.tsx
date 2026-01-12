// frontend/src/components/Sidebar.tsx

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
}

const AlertsDrawer: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    lowStockReagents: Reagent[];
    recentlyAddedReagents: Reagent[];
}> = ({ isOpen, onClose, lowStockReagents, recentlyAddedReagents }) => (
    <>
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
        <div className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out w-80 ${isOpen ? 'transform-none' : '-translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg text-gray-800">Alertas e Informes</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                {/* Low Stock Section */}
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>
                        Estoque Baixo
                    </h3>
                    {lowStockReagents.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {lowStockReagents.map(r => (
                                <li key={r.id} className="flex justify-between items-center p-2 rounded-md bg-yellow-50 text-yellow-800">
                                    <span className="font-medium">{r.name}</span>
                                    <span className="font-mono bg-yellow-200 px-2 py-0.5 rounded">{r.quantity}{r.unit}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 p-2">Nenhum reagente com estoque baixo.</p>
                    )}
                </div>

                {/* Recently Added Section */}
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-sparkles text-blue-500"></i>
                        Adicionados Recentemente
                    </h3>
                    {recentlyAddedReagents.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {recentlyAddedReagents.map(r => (
                                <li key={r.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 text-gray-700">
                                    <span className="font-medium">{r.name}</span>
                                    <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-sm text-gray-500 p-2">Nenhum reagente adicionado recentemente.</p>
                    )}
                </div>
            </div>
        </div>
    </>
);


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, user, onToggleRole, isCollapsed, toggleSidebar, reagents }) => {
  const [isSystemsOpen, setIsSystemsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const lowStockReagents = reagents.filter(r => r.quantity > 0 && r.quantity <= r.minStockLevel);
  const lowStockCount = lowStockReagents.length;

  const recentlyAddedReagents = [...reagents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const navItems = [
    { id: 'dashboard', name: 'Visão Geral', icon: 'fa-chart-pie' }, 
    { id: 'inventory', name: 'Estoque', icon: 'fa-flask' },
    // NOVO: Adicionado para todos os usuários verem seus pedidos
    { id: 'my-requests', name: 'Meus Pedidos', icon: 'fa-list-check' }, 
    // ATUALIZADO: Nome mudou para Central de Pedidos (Admin Only)
    { id: 'withdrawals', name: 'Central de Pedidos', icon: 'fa-dolly', adminOnly: true },
    { id: 'waste', name: 'Resíduos', icon: 'fa-recycle', adminOnly: true },
  ];
  
  const systemLinks = [
      { name: 'Portal Unilab', href: 'https://unilab.edu.br/' },
      { name: 'SIGAA', href: 'https://sig.unilab.edu.br/sigaa/' },
      { name: 'SEI', href: 'https://sei.unilab.edu.br/' },
      { name: 'Biblioteca (Pergamum)', href: 'https://bibweb.unilab.edu.br/' },
  ];

  return (
    <>
    <aside className={`fixed top-0 left-0 h-full bg-unilab-blue text-white transition-all duration-300 z-30 flex flex-col ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex items-center justify-between h-[120px] px-6 border-b border-blue-800 flex-shrink-0">
            <div className={`flex items-center gap-3 overflow-hidden transition-opacity ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {/* Logo/Nome geridos pelo Header */}
            </div>
            <button onClick={toggleSidebar} className="text-2xl hover:text-green-400 h-full px-2 -mr-4 focus:outline-none">
                <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
            </button>
        </div>
        
        <nav className="flex-grow p-4 overflow-y-auto scrollbar-thin">
            <ul>
                {navItems.map(item => {
                    if (item.adminOnly && user.role !== 'ADMIN') return null;
                    return (
                        <li key={item.id}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setView(item.id); }}
                               className={`flex items-center py-3 px-4 my-1 rounded-md transition-colors ${activeView === item.id ? 'bg-unilab-green text-white shadow-sm' : 'hover:bg-blue-800 text-blue-100'}`}>
                                <i className={`fa-solid ${item.icon} w-8 text-center text-xl`}></i>
                                {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
                            </a>
                        </li>
                    )
                })}
                
                 <li key="systems-accordion">
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsSystemsOpen(!isSystemsOpen); }}
                        className={`flex items-center py-3 px-4 my-1 rounded-md transition-colors hover:bg-blue-800 text-blue-100`}>
                        <i className={`fa-solid fa-layer-group w-8 text-center text-xl`}></i>
                        {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Sistemas Unilab</span>}
                        {!isCollapsed && <i className={`fa-solid fa-chevron-down ml-auto transition-transform ${isSystemsOpen ? 'rotate-180' : ''}`}></i>}
                    </a>
                    {isSystemsOpen && !isCollapsed && (
                        <ul className="pl-12 py-1 bg-blue-900/30 rounded-md mb-2">
                            {systemLinks.map(link => (
                                <li key={link.name}>
                                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center py-2 px-4 text-sm hover:text-green-300 text-blue-200 rounded-md transition-colors">
                                        <i className="fa-solid fa-arrow-up-right-from-square mr-2 text-xs opacity-70"></i>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
                <li key='alerts'>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsDrawerOpen(true); }}
                       className={`relative flex items-center py-3 px-4 my-1 rounded-md transition-colors hover:bg-blue-800 text-blue-100`}>
                        <i className={`fa-solid fa-bell w-8 text-center text-xl`}></i>
                        {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">Alertas</span>}
                        {lowStockCount > 0 && (
                            <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-unilab-blue animate-pulse">
                                {lowStockCount}
                            </span>
                        )}
                    </a>
                </li>
            </ul>
        </nav>

        <div className="p-4 border-t border-blue-800 flex-shrink-0 bg-blue-900/20">
             <div className="p-3 rounded-md">
                <div className="flex items-center gap-3">
                    <div className={`transition-all ${isCollapsed ? 'w-full flex justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold border-2 border-green-400">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm whitespace-nowrap text-white">{user.name.split(' ')[0]}</p>
                            <p className="text-xs text-blue-300 whitespace-nowrap uppercase tracking-wider">{user.role === 'ADMIN' ? 'Administrador' : 'Pesquisador'}</p>
                        </div>
                    )}
                </div>
            </div>
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