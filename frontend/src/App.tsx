// frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { WasteManagement } from './components/WasteManagement';
import { Withdrawals } from './components/Withdrawals';
import { AccessibilityDock } from './components/AccessibilityDock';
import { MyRequests } from './components/MyRequests'; // <--- 1. Importação Nova
import { Login } from './components/Login'; 
import { User, Reagent, WithdrawalRequest } from './types';
import { api, updateReagent } from './services/api'; 

import { ToastContainer, toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastProps {
  msg: string;
  type: 'success' | 'error' | 'info';
}

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
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const [reagents, setReagents] = useState<Reagent[]>([]); 
  
  // (Nota: Removemos o estado 'withdrawals' daqui, pois agora cada componente busca seus dados)

  // --- Efeitos (Side Effects) ---

  // 1. Recuperar Sessão
  useEffect(() => {
    const storedUser = localStorage.getItem('siru_user');
    const storedToken = localStorage.getItem('siru_token');

    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // 2. Carregar Dados Iniciais (Apenas Reagentes agora)
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

  // --- Handlers de Autenticação ---
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

  // --- Handlers de UI ---
  // (Mantido para compatibilidade com código legado, mas preferimos usar toastify direto)
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
        const newSize = increase ? prev + 1 : prev - 1;
        return Math.max(12, Math.min(22, newSize)); 
    });
  };

  // --- Handlers de Reagentes ---
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

  const handleDeleteReagent = async (id: string) => {
    if (!window.confirm("Confirmar exclusão permanente?")) return;
    try {
        await api.delete(`/reagents/${id}`);
        setReagents(prev => prev.filter(item => item.id !== id));
        toastify.success('Reagente excluído.');
    } catch (error) {
        toastify.error('Erro ao excluir reagente.');
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

  // --- Handlers de Pedidos ---
  const handleCreateWithdrawalRequest = async (newRequest: WithdrawalRequest) => {
    try {
      // 1. Prepara o payload para o novo formato do backend (itens array)
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
      
      // 2. Redireciona o usuário para ver o pedido na nova tela
      setCurrentView('my-requests');

    } catch (error) {
      toastify.error('Erro ao enviar solicitação.');
    }
  };

  // --- Renderização ---
  const renderView = () => {
    if (!currentUser) return null;
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
      
      case 'inventory': 
        return <Inventory user={currentUser} reagents={reagents} onAddReagent={handleAddReagent} onDeleteReagent={handleDeleteReagent} onUpdateReagent={handleUpdateReagent} onRequestWithdrawal={handleCreateWithdrawalRequest} />;
      
      // <--- 2. Rota Nova: Meus Pedidos
      case 'my-requests':
        return <MyRequests user={currentUser} />;

      case 'withdrawals': 
        if (currentUser.role !== 'ADMIN') {
              return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
        }
        // <--- 3. Ajuste: Componente agora busca seus proprios dados (sem props)
        return <Withdrawals />;
      
      case 'waste': 
        return <WasteManagement user={currentUser} />;
      
      default: 
        return <Dashboard user={currentUser} onNavigate={setCurrentView} />;
    }
  };

  const getTitle = (view: string) => {
    const titles: {[key: string]: string} = {
      'dashboard': 'Painel de Controle',
      'inventory': 'Estoque de Reagentes',
      'my-requests': 'Meus Pedidos', // <--- 4. Título Novo
      'withdrawals': 'Central de Pedidos', // Nome atualizado
      'waste': 'Gestão de Resíduos',
    };
    return titles[view] || 'SIRU';
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Login onLoginSuccess={handleLoginSuccess} />
        
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="colored" 
          aria-label="Notificações do sistema"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Header isSidebarCollapsed={isSidebarCollapsed} />
      
      <div className="flex pt-[120px]">
        <AccessibilityDock onFontSizeChange={handleFontSizeChange} onContrastToggle={() => setIsHighContrast(!isHighContrast)} />
        
        <Sidebar 
          activeView={currentView} 
          setView={setCurrentView} 
          user={currentUser}
          onToggleRole={() => {}} 
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          reagents={reagents}
        />
        
        <main id="main-content" className={`flex-1 p-8 overflow-y-auto h-[calc(100vh-120px)] relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          
          {/* Toast legado (opcional) */}
          {toast && (
            <div className={`fixed top-36 right-6 z-50 px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              <i className={`fa-solid ${
                toast.type === 'success' ? 'fa-circle-check' : 
                toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle'
              }`}></i>
              <span className="font-medium">{toast.msg}</span>
            </div>
          )}

          {/* Toast Principal */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            aria-label="Notificações do sistema"
          />

          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">{getTitle(currentView)}</h1>
              <p className="text-sm text-gray-500 mt-1">Sistema Integrado de Reagentes da Unilab</p>
            </div>
            
            <div className="flex items-center space-x-4">
               <button onClick={handleLogout} className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-2">
                 <i className="fa-solid fa-right-from-bracket"></i> Sair
               </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fa-solid fa-bell text-xl"></i>
              </button>
            </div>
          </header>

          {renderView()}
        </main>
      </div>
    </div>
  );
};