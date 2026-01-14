import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { CreateUserModal } from './UserModals'; // Certifique-se de que este componente aceita a prop 'selectedUser' para edição

// --- SUB-COMPONENTE: Modal de Confirmação de Segurança ---
const ConfirmActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant: 'danger' | 'primary' | 'success';
}> = ({ isOpen, onClose, onConfirm, title, message, variant }) => {
  if (!isOpen) return null;
  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <i className={`fa-solid ${variant === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-question'} text-3xl`}></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancelar</button>
            <button onClick={onConfirm} className={`px-6 py-2 rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${colors[variant]}`}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'RESEARCHER' });

  // Estados para Confirmações
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'SAVE' | 'DELETE' | null;
    data?: any;
  }>({ isOpen: false, type: null });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  // Abrir para Edição ou Criação
  const handleOpenModal = (user: any = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'RESEARCHER' });
    }
    setShowModal(true);
  };

  // Ponto 3 e 4: Gatilho de confirmação para Salvar/Editar
  const triggerSaveConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({ isOpen: true, type: 'SAVE' });
  };

  const handleFinalSave = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, formData);
        toast.success(`Alterações em ${formData.name} salvas!`);
      } else {
        await api.post('/users', formData);
        toast.success(`Usuário ${formData.name} criado com sucesso!`);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar usuário.");
    } finally {
      setConfirmModal({ isOpen: false, type: null });
    }
  };

  // Ponto 5: Gatilho de confirmação para Excluir
  const triggerDeleteConfirm = (user: any) => {
    setConfirmModal({ isOpen: true, type: 'DELETE', data: user });
  };

  const handleFinalDelete = async () => {
    const user = confirmModal.data;
    try {
      await api.delete(`/users/${user.id}`);
      toast.success("Acesso removido com sucesso.");
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover usuário.");
    } finally {
      setConfirmModal({ isOpen: false, type: null });
    }
  };

  if (loading) return <div className="p-10 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Modais de Suporte */}
      <CreateUserModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSubmit={triggerSaveConfirm} 
        formData={formData} 
        setFormData={setFormData}
        isEditing={!!selectedUser}
      />

      <ConfirmActionModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={confirmModal.type === 'DELETE' ? handleFinalDelete : handleFinalSave}
        title={confirmModal.type === 'DELETE' ? "Confirmar Exclusão" : "Salvar Informações"}
        message={confirmModal.type === 'DELETE' 
          ? `Tem certeza que deseja remover o acesso de ${confirmModal.data?.name}? Esta ação não pode ser desfeita.` 
          : "Deseja confirmar o processamento destes dados de usuário no SIRU?"}
        variant={confirmModal.type === 'DELETE' ? 'danger' : 'success'}
      />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-users-gear text-blue-600"></i> Gestão de Usuários
          </h2>
          <p className="text-sm text-gray-500">Controle quem pode acessar o SIRU UNILAB.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100">
          <i className="fa-solid fa-user-plus"></i> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b uppercase font-black tracking-widest">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">E-mail/Login</th>
              <th className="p-4 text-center">Acesso</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 font-bold text-gray-800">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2">
                  <button 
                    onClick={() => handleOpenModal(u)} 
                    className="text-blue-400 hover:text-blue-600 p-2 transition-colors" 
                    title="Editar Usuário"
                  >
                    <i className="fa-solid fa-user-pen"></i>
                  </button>
                  <button 
                    onClick={() => triggerDeleteConfirm(u)} 
                    className="text-red-400 hover:text-red-600 p-2 transition-colors" 
                    title="Excluir Usuário"
                  >
                    <i className="fa-solid fa-user-xmark"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};