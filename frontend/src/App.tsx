import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { WasteManagement } from './components/WasteManagement';
import { SafetyAssistant } from './components/SafetyAssistant';
import { Withdrawals } from './components/Withdrawals';
import { AccessibilityDock } from './components/AccessibilityDock';
import { Login } from './components/Login'; 
import { User, Reagent, WithdrawalRequest, WasteLog, RequestStatus } from './types';
import { MOCK_WASTE_LOGS, MOCK_NEWS } from './constants';
import { api, updateReagent } from './services/api'; 

interface ToastProps {
  msg: string;
  type: 'success' | 'error' | 'info';
}

export const App: React.FC = () => {
  // --- Estados Principais ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Persistência da navegação (Evita voltar ao Dashboard no F5)
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
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]); 
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(MOCK_WASTE_LOGS);

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

  // 2. Carregar Dados Iniciais
  useEffect(() => {
    if (!currentUser) return; 

    const fetchData = async () => {
      try {
        const [resReagents, resRequests] = await Promise.all([
          api.get('/reagents'),
          api.get('/requests')
        ]);

        setReagents(resReagents.data);

        // Mapeamento e proteção de dados dos pedidos
        const formattedRequests = resRequests.data.map((req: any) => {
           const hasItems = req.items && Array.isArray(req.items) && req.items.length > 0;
           const firstItem = hasItems ? req.items[0] : null;
           const reagent = firstItem ? firstItem.reagent : null;

           return {
             id: req.id,
             reagentId: reagent?.id || 'unknown',
             reagentName: reagent?.name || 'Reagente Removido',
             amount: firstItem?.quantity || 0,
             unit: reagent?.unit || 'UNID',
             requestedBy: req.user?.name || 'Desconhecido',
             requestedAt: req.createdAt,
             // Normalização do Status para garantir compatibilidade visual
             status: req.status ? req.status.toUpperCase() : 'PENDING',
             reason: req.reason || '',
             usageDate: req.usageDate 
           };
        });

        setWithdrawals(formattedRequests);

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
    showToast(`Bem-vindo, ${user.name}!`);
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
      showToast('Reagente salvo com sucesso!');
    } catch (error) {
      showToast('Erro ao salvar reagente.', 'error');
    }
  };

  const handleDeleteReagent = async (id: string) => {
    if (!window.confirm("Confirmar exclusão permanente?")) return;
    try {
        await api.delete(`/reagents/${id}`);
        setReagents(prev => prev.filter(item => item.id !== id));
        showToast('Reagente excluído.');
    } catch (error) {
        showToast('Erro ao excluir reagente.', 'error');
    }
  };

  const handleUpdateReagent = async (updatedReagent: Reagent) => {
    try {
      const saved = await updateReagent(updatedReagent.id, updatedReagent);
      setReagents(prev => prev.map(item => item.id === saved.id ? saved : item));
      showToast('Reagente atualizado!');
    } catch (error) {
      showToast('Erro ao atualizar reagente.', 'error');
    }
  };

  // --- Handlers de Pedidos e Retiradas ---
  const handleCreateWithdrawalRequest = async (newRequest: WithdrawalRequest) => {
    try {
      const payload = {
        reagentId: newRequest.reagentId,
        amount: Number(newRequest.amount),
        reason: newRequest.reason,
        usageDate: newRequest.usageDate
      };

      const response = await api.post('/requests', payload);

      const createdRequest: WithdrawalRequest = {
        ...newRequest,
        id: response.data.id,
        status: RequestStatus.PENDING,
        requestedAt: new Date().toISOString(),
        requestedBy: currentUser?.name || 'Eu'
      };

      setWithdrawals(prev => [createdRequest, ...prev]);
      showToast('Solicitação enviada para aprovação!', 'success');
    } catch (error) {
      showToast('Erro ao enviar solicitação.', 'error');
    }
  };

  const handleWithdrawalAction = async (id: string, newStatus: RequestStatus) => {
    try {
      // Blindagem contra status inválido
      const statusPayload = String(newStatus).toUpperCase();

      await api.patch(`/requests/${id}/status`, { status: statusPayload });

      setWithdrawals(prev => prev.map(req => 
        req.id === id ? { ...req, status: statusPayload as RequestStatus } : req
      ));

      if (statusPayload === 'APPROVED') {
        const request = withdrawals.find(w => w.id === id);
        if (request) {
            setReagents(prev => prev.map(r => 
                r.id === request.reagentId 
                ? { ...r, quantity: Number((r.quantity - request.amount).toFixed(2)) } 
                : r
            ));
        }
        showToast('Solicitação aprovada. Estoque atualizado.', 'success');
      } else {
        showToast('Solicitação recusada.', 'info');
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || 'Erro ao processar solicitação.';
      showToast(msg, 'error');
    }
  };

  // --- Gestão de Resíduos (Mock) ---
  const handleAddWasteLog = (newLog: WasteLog) => {
    setWasteLogs(prev => [newLog, ...prev]);
    showToast('Descarte registrado.');
  };

  // --- Renderização ---
  const renderView = () => {
    if (!currentUser) return null;
    switch (currentView) {
      case 'dashboard': return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS} />;
      case 'inventory': return <Inventory user={currentUser} reagents={reagents} onAddReagent={handleAddReagent} onDeleteReagent={handleDeleteReagent} onUpdateReagent={handleUpdateReagent} onRequestWithdrawal={handleCreateWithdrawalRequest} />;
      case 'withdrawals': 
        if (currentUser.role !== 'ADMIN') return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
        return <Withdrawals requests={withdrawals} onAction={handleWithdrawalAction} />;
      case 'waste': 
        if (currentUser.role !== 'ADMIN') return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
        return <WasteManagement logs={wasteLogs} onAddLog={handleAddWasteLog} />;
      case 'assistant': return <SafetyAssistant />;
      default: return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
    }
  };

  const getTitle = (view: string) => {
    const titles: {[key: string]: string} = {
      'dashboard': 'Painel de Controle',
      'inventory': 'Estoque de Reagentes',
      'withdrawals': 'Aprovação de Retiradas',
      'waste': 'Gestão de Resíduos',
      'assistant': 'Assistente de Segurança'
    };
    return titles[view] || 'SIRU';
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Login onLoginSuccess={handleLoginSuccess} />
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