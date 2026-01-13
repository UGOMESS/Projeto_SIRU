import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { WasteManagement } from './components/WasteManagement';
import { Withdrawals } from './components/Withdrawals';
import { AccessibilityDock } from './components/AccessibilityDock';
import { MyRequests } from './components/MyRequests';
import { Login } from './components/Login'; 
import { User, Reagent, WithdrawalRequest } from './types';
import { api, updateReagent } from './services/api'; 

import { ToastContainer, toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- SUB-COMPONENTE: Modal de Confirmação de Exclusão ---
const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <i className="fa-solid fa-trash-can text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Excluir Item?</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Tem certeza que deseja excluir <strong>{itemName}</strong>? <br/>
                        Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition-colors">
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const App: React.FC = () => {
  // --- Estados Principais ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Persistência da navegação
  const [currentView, setCurrentViewState] = useState(localStorage.getItem('siru_view') || 'dashboard');
  
  const setCurrentView = (view: string) => {
    localStorage.setItem('siru_view', view);
    setCurrentViewState(view);
  };

  // Estados de UI e Dados
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const [reagents, setReagents] = useState<Reagent[]>([]); 
  
  // Estados para o Modal de Exclusão
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  // --- Efeitos (Side Effects) ---
  useEffect(() => {
    const storedUser = localStorage.getItem('siru_user');
    const storedToken = localStorage.getItem('siru_token');

    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return; 

    const fetchData = async () => {
      try {
        const resReagents = await api.get('/reagents');
        setReagents(resReagents.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if ((error as any).response?.status === 401) {
              handleLogout();
        }
      }
    };

    fetchData();
  }, [currentUser]); 

  // --- Handlers ---
  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem('siru_user', JSON.stringify(user));
    localStorage.setItem('siru_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(user);
    toastify.success(`Bem-vindo, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('siru_user');
    localStorage.removeItem('siru_token');
    localStorage.removeItem('siru_view');
    api.defaults.headers.common['Authorization'] = '';
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
        const newSize = increase ? prev + 1 : prev - 1;
        return Math.max(12, Math.min(22, newSize)); 
    });
  };

  const handleAddReagent = async (newReagent: Reagent) => {
    try {
      const { id, ...reagentData } = newReagent;
      const response = await api.post('/reagents', reagentData);
      setReagents(prev => [response.data, ...prev]);
      toastify.success('Reagente salvo com sucesso!');
    } catch (error) {
      toastify.error('Erro ao salvar reagente.');
    }
  };

  // Abre o Modal
  const handleRequestDelete = (id: string) => {
    const reagent = reagents.find(r => r.id === id);
    if (reagent) {
        setItemToDelete({ id: reagent.id, name: reagent.name });
    }
  };

  // Executa a exclusão
  const confirmDeleteReagent = async () => {
    if (!itemToDelete) return;

    try {
        await api.delete(`/reagents/${itemToDelete.id}`);
        setReagents(prev => prev.filter(item => item.id !== itemToDelete.id));
        toastify.success('Reagente excluído.');
    } catch (error) {
        toastify.error('Erro ao excluir reagente.');
    } finally {
        setItemToDelete(null); 
    }
  };

  const handleUpdateReagent = async (updatedReagent: Reagent) => {
    try {
      const saved = await updateReagent(updatedReagent.id, updatedReagent);
      setReagents(prev => prev.map(item => item.id === saved.id ? saved : item));
      toastify.success('Reagente atualizado!');
    } catch (error) {
      toastify.error('Erro ao atualizar reagente.');
    }
  };

  const handleCreateWithdrawalRequest = async (newRequest: WithdrawalRequest) => {
    try {
      const payload = {
        items: [{
            reagentId: newRequest.reagentId,
            quantity: Number(newRequest.amount)
        }],
        reason: newRequest.reason,
        usageDate: newRequest.usageDate
      };

      await api.post('/requests', payload);
      toastify.success('Solicitação enviada! Acompanhe em "Meus Pedidos".');
      setCurrentView('my-requests');

    } catch (error) {
      toastify.error('Erro ao enviar solicitação.');
    }
  };

  const renderView = () => {
    if (!currentUser) return null;
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
      
      case 'inventory': 
        return (
            <Inventory 
                user={currentUser} 
                reagents={reagents} 
                onAddReagent={handleAddReagent} 
                onDeleteReagent={handleRequestDelete} // <--- Passa a função do Modal
                onUpdateReagent={handleUpdateReagent} 
                onRequestWithdrawal={handleCreateWithdrawalRequest} 
            />
        );
      
      case 'my-requests': return <MyRequests user={currentUser} />;
      case 'withdrawals': return currentUser.role === 'ADMIN' ? <Withdrawals /> : <Dashboard user={currentUser} onNavigate={setCurrentView} />;
      case 'waste': return <WasteManagement user={currentUser} />;
      default: return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
    }
  };

  const getTitle = (view: string) => {
    const titles: {[key: string]: string} = {
      'dashboard': 'Painel de Controle', 'inventory': 'Estoque de Reagentes',
      'my-requests': 'Meus Pedidos', 'withdrawals': 'Central de Pedidos', 'waste': 'Gestão de Resíduos',
    };
    return titles[view] || 'SIRU';
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" aria-label="Notificações" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" aria-label="Notificações" />
        <DeleteConfirmModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDeleteReagent} itemName={itemToDelete?.name || 'Item'} />
        
        <Header isSidebarCollapsed={isSidebarCollapsed} />
      
      <div className="flex pt-[120px]">
        <AccessibilityDock onFontSizeChange={handleFontSizeChange} onContrastToggle={() => setIsHighContrast(!isHighContrast)} />
        
        <Sidebar 
          activeView={currentView} setView={setCurrentView} user={currentUser}
          isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          reagents={reagents} onLogout={handleLogout}
          isOpen={!isSidebarCollapsed} onClose={() => setIsSidebarCollapsed(true)}
        />
        
        <main id="main-content" className={`flex-1 p-8 overflow-y-auto h-[calc(100vh-120px)] relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">{getTitle(currentView)}</h1>
              <p className="text-sm text-gray-500 mt-1">Sistema Integrado de Reagentes da Unilab</p>
            </div>
            <div className="flex items-center space-x-4">
               <button onClick={handleLogout} className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-2">
                 <i className="fa-solid fa-right-from-bracket"></i> Sair
               </button>
            </div>
          </header>
          {renderView()}
        </main>
      </div>
    </div>
  );
};