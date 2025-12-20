// frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { WasteManagement } from './components/WasteManagement';
import { SafetyAssistant } from './components/SafetyAssistant';
import { Withdrawals } from './components/Withdrawals';
import { AccessibilityDock } from './components/AccessibilityDock';
// Importando o componente de Login
import { Login } from './components/Login'; 
import { User, Reagent, WithdrawalRequest, WasteLog, RequestStatus } from './types';
import { MOCK_WITHDRAWALS, MOCK_WASTE_LOGS, MOCK_NEWS } from './constants';
import { api, updateReagent } from './services/api'; 

interface ToastProps {
  msg: string;
  type: 'success' | 'error' | 'info';
}

export const App: React.FC = () => {
  // --- ESTADO DE AUTENTICAÇÃO ---
  // Começa null (deslogado). Se tiver algo no localStorage, o useEffect preenche depois.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Estados de Dados
  const [reagents, setReagents] = useState<Reagent[]>([]); 
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(MOCK_WITHDRAWALS);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(MOCK_WASTE_LOGS);

  // --- 1. VERIFICAR LOGIN AO INICIAR ---
  useEffect(() => {
    const storedUser = localStorage.getItem('siru_user');
    const storedToken = localStorage.getItem('siru_token');

    if (storedUser && storedToken) {
      // Reconecta o usuário e configura o Token no Axios
      setCurrentUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // --- 2. BUSCAR DADOS (SÓ SE ESTIVER LOGADO) ---
  useEffect(() => {
    if (!currentUser) return; // Não busca nada se não estiver logado

    const fetchReagents = async () => {
      try {
        const response = await api.get('/reagents');
        setReagents(response.data);
      } catch (error) {
        console.error("Erro ao conectar com a API:", error);
        // Se der erro 401 (não autorizado), poderíamos deslogar o usuário aqui
        if ((error as any).response?.status === 401) {
             handleLogout();
        } else {
             showToast("Erro ao carregar dados.", "error");
        }
      }
    };

    fetchReagents();
  }, [currentUser]); // Executa sempre que o usuário logar

  // --- HANDLERS DE AUTENTICAÇÃO ---
  const handleLoginSuccess = (user: User, token: string) => {
    // Salva no navegador para não perder ao dar F5
    localStorage.setItem('siru_user', JSON.stringify(user));
    localStorage.setItem('siru_token', token);
    
    // Configura o token para as próximas requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setCurrentUser(user);
    showToast(`Bem-vindo, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('siru_user');
    localStorage.removeItem('siru_token');
    api.defaults.headers.common['Authorization'] = '';
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  // --- Outros Handlers (UI) ---
  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
        const newSize = increase ? prev + 1 : prev - 1;
        return Math.max(12, Math.min(22, newSize)); 
    });
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddReagent = async (newReagent: Reagent) => {
    try {
      const { id, ...reagentData } = newReagent;
      const response = await api.post('/reagents', reagentData);
      setReagents(prev => [response.data, ...prev]);
      showToast('Reagente salvo no Banco de Dados!');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast('Erro ao salvar no banco de dados.', 'error');
    }
  };

  const handleDeleteReagent = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este reagente permanentemente?")) {
        return;
    }
    try {
        await api.delete(`/reagents/${id}`);
        setReagents(prevReagents => prevReagents.filter(item => item.id !== id));
        showToast('Reagente excluído com sucesso.');
    } catch (error) {
        console.error("Erro ao excluir:", error);
        showToast('Erro ao excluir do banco de dados.', 'error');
    }
  };

  const handleUpdateReagent = async (updatedReagent: Reagent) => {
    try {
      const savedReagent = await updateReagent(updatedReagent.id, updatedReagent);
      setReagents(prev => prev.map(item => 
        item.id === savedReagent.id ? savedReagent : item
      ));
      showToast('Reagente atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      showToast('Erro ao atualizar no banco de dados.', 'error');
    }
  };

  // Funções Mockadas (ainda não conectadas ao backend real de Pedidos)
  const handleCreateWithdrawalRequest = (newRequest: WithdrawalRequest) => {
    setWithdrawals(prev => [newRequest, ...prev]);
    showToast('Solicitação enviada para aprovação!', 'success');
  };
  const handleAddWasteLog = (newLog: WasteLog) => {
    setWasteLogs(prev => [newLog, ...prev]);
    showToast('Descarte registrado corretamente.');
  };
  const handleWithdrawalAction = (id: string, newStatus: RequestStatus) => {
     // Lógica visual mantida igual ao anterior para não quebrar
     const request = withdrawals.find(w => w.id === id);
    if (!request) return;

    if (newStatus === RequestStatus.APPROVED) {
        const reagent = reagents.find(r => r.id === request.reagentId);
        if (!reagent) {
            showToast(`Erro: Reagente "${request.reagentName}" não encontrado.`, 'error');
            return;
        }
        if (reagent.quantity < request.amount) {
            showToast(`Erro: Estoque insuficiente para "${request.reagentName}".`, 'error');
            return;
        }
        setReagents(prev => prev.map(r => 
            r.id === request.reagentId 
            ? { ...r, quantity: Number((r.quantity - request.amount).toFixed(2)) } 
            : r
        ));
        showToast('Solicitação aprovada e estoque atualizado!');
    } else {
        showToast('Solicitação recusada.');
    }
    setWithdrawals(prev => prev.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  const renderView = () => {
    // Se user for null (não deveria chegar aqui se a lógica do return principal funcionar)
    if (!currentUser) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS} />;
      case 'inventory':
        return <Inventory user={currentUser} reagents={reagents} onAddReagent={handleAddReagent} onDeleteReagent={handleDeleteReagent} onUpdateReagent={handleUpdateReagent} onRequestWithdrawal={handleCreateWithdrawalRequest} />;
      case 'withdrawals':
        if (currentUser.role !== 'ADMIN') return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
        return <Withdrawals requests={withdrawals} onAction={handleWithdrawalAction} />;
      case 'waste':
        if (currentUser.role !== 'ADMIN') return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
        return <WasteManagement logs={wasteLogs} onAddLog={handleAddWasteLog} />;
      case 'assistant':
        return <SafetyAssistant />;
      default:
        return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
    }
  };

  const getTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Painel de Controle';
      case 'inventory': return 'Estoque de Reagentes';
      case 'withdrawals': return 'Aprovação de Retiradas';
      case 'waste': return 'Gestão de Resíduos';
      case 'assistant': return 'Assistente de Segurança';
      default: return 'SIRU';
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  // 1. Se NÃO estiver logado, mostra APENAS o Login
  if (!currentUser) {
    return (
      <div className={`min-h-screen font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // 2. Se ESTIVER logado, mostra o App completo
  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Header isSidebarCollapsed={isSidebarCollapsed} />
      
      <div className="flex pt-[120px]">
        <AccessibilityDock onFontSizeChange={handleFontSizeChange} onContrastToggle={() => setIsHighContrast(!isHighContrast)} />
        
        <Sidebar 
          activeView={currentView} 
          setView={setCurrentView} 
          user={currentUser}
          onToggleRole={() => {}} // Removemos a troca fake de papel
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          reagents={reagents}
        />
        
        <main id="main-content" className={`flex-1 p-8 overflow-y-auto h-[calc(100vh-120px)] relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
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

          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {getTitle(currentView)}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sistema Integrado de Reagentes da Unilab
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
               {/* Botão de Logout */}
               <button 
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-2"
                  title="Sair do Sistema"
               >
                 <i className="fa-solid fa-right-from-bracket"></i>
                 Sair
               </button>

              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fa-solid fa-bell text-xl"></i>
              </button>
            </div>
          </header>

          {renderView()}
        </main>
      </div>
      
      <footer id="footer" className="hidden">
         Informações do rodapé.
      </footer>
    </div>
  );
};