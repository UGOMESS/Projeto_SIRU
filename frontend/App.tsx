
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { WasteManagement } from './components/WasteManagement';
import { SafetyAssistant } from './components/SafetyAssistant';
import { Withdrawals } from './components/Withdrawals';
import { AccessibilityDock } from './components/AccessibilityDock';
import { User, Reagent, WithdrawalRequest, WasteLog, RequestStatus } from './types';
import { MOCK_REAGENTS, MOCK_WITHDRAWALS, MOCK_WASTE_LOGS, MOCK_NEWS } from './constants';

const MOCK_ADMIN: User = {
  id: 'u1',
  name: 'Admin Principal',
  email: 'admin@unilab.br',
  role: 'ADMIN'
};

const MOCK_RESEARCHER: User = {
  id: 'u2',
  name: 'Pesquisador Silva',
  email: 'silva@unilab.br',
  role: 'RESEARCHER'
};

interface ToastProps {
  msg: string;
  type: 'success' | 'error' | 'info';
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(MOCK_ADMIN);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Global State (Lifted Up)
  const [reagents, setReagents] = useState<Reagent[]>(MOCK_REAGENTS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(MOCK_WITHDRAWALS);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(MOCK_WASTE_LOGS);

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
        const newSize = increase ? prev + 1 : prev - 1;
        return Math.max(12, Math.min(22, newSize)); // Clamp font size between 12px and 22px
    });
  };

  // Toast Helper
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleUserRole = () => {
    setCurrentUser(prev => {
      const newUser = prev.role === 'ADMIN' ? MOCK_RESEARCHER : MOCK_ADMIN;
      showToast(`Perfil alternado para: ${newUser.role === 'ADMIN' ? 'Administrador' : 'Pesquisador'}`, 'info');
      // Force return to dashboard if switching to restricted role while on restricted page
      if (newUser.role === 'RESEARCHER' && (currentView === 'waste' || currentView === 'withdrawals')) {
        setCurrentView('dashboard');
      }
      return newUser;
    });
  };

  // --- Handlers ---

  const handleAddReagent = (newReagent: Reagent) => {
    setReagents(prev => [newReagent, ...prev]);
    showToast('Reagente adicionado ao estoque com sucesso!');
  };

  const handleDeleteReagent = (id: string) => {
    setReagents(prev => prev.filter(r => r.id !== id));
    showToast('Reagente removido do sistema.');
  };

  const handleCreateWithdrawalRequest = (newRequest: WithdrawalRequest) => {
    setWithdrawals(prev => [newRequest, ...prev]);
    showToast('Solicitação enviada para aprovação!', 'success');
  };

  const handleAddWasteLog = (newLog: WasteLog) => {
    setWasteLogs(prev => [newLog, ...prev]);
    showToast('Descarte registrado corretamente.');
  };

  const handleWithdrawalAction = (id: string, newStatus: RequestStatus) => {
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
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={currentUser} 
            reagents={reagents}
            wasteLogs={wasteLogs}
            onNavigate={setCurrentView}
            news={MOCK_NEWS}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            user={currentUser} 
            reagents={reagents}
            onAddReagent={handleAddReagent}
            onDeleteReagent={handleDeleteReagent}
            onRequestWithdrawal={handleCreateWithdrawalRequest}
          />
        );
      case 'withdrawals':
        if (currentUser.role !== 'ADMIN') return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
        return (
          <Withdrawals 
            requests={withdrawals}
            onAction={handleWithdrawalAction}
          />
        );
      case 'waste':
        if (currentUser.role !== 'ADMIN') return <Dashboard user={currentUser} reagents={reagents} wasteLogs={wasteLogs} onNavigate={setCurrentView} news={MOCK_NEWS}/>;
        return (
          <WasteManagement 
            logs={wasteLogs}
            onAddLog={handleAddWasteLog}
          />
        );
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

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-slate-800 ${isHighContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
        <Header isSidebarCollapsed={isSidebarCollapsed} />
      
      <div className="flex pt-[120px]">
        <AccessibilityDock onFontSizeChange={handleFontSizeChange} onContrastToggle={() => setIsHighContrast(!isHighContrast)} />
        <Sidebar 
          activeView={currentView} 
          setView={setCurrentView} 
          user={currentUser}
          onToggleRole={toggleUserRole}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          reagents={reagents}
        />
        
        <main id="main-content" className={`flex-1 p-8 overflow-y-auto h-[calc(100vh-120px)] relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          {/* Toast Notification */}
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
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fa-solid fa-bell text-xl"></i>
                {(() => {
                  if (currentUser.role !== 'ADMIN') return null;
                  const pendingCount = withdrawals.filter(w => w.status === RequestStatus.PENDING).length;
                  if (pendingCount > 0) {
                    return (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white ring-2 ring-gray-50">
                        {pendingCount}
                      </span>
                    );
                  }
                  return null;
                })()}
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
