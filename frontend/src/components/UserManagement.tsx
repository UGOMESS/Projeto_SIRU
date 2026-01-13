import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { CreateUserModal } from './UserModals';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'RESEARCHER' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users'); // Você precisará criar essa rota no backend
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.warning("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    try {
      await api.post('/users', formData);
      toast.success(`Usuário ${formData.name} criado!`);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'RESEARCHER' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao criar usuário.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover usuário.");
    }
  };

  if (loading) return <div className="p-10 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <CreateUserModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleCreate} formData={formData} setFormData={setFormData} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-users-gear text-blue-600"></i> Gestão de Usuários
          </h2>
          <p className="text-sm text-gray-500">Controle quem pode acessar o SIRU UNILAB.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100">
          <i className="fa-solid fa-user-plus"></i> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">E-mail/Login</th>
              <th className="p-4 font-semibold">Acesso</th>
              <th className="p-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 font-medium text-gray-800">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(u.id, u.name)} className="text-red-400 hover:text-red-600 p-2 transition-colors" title="Excluir Usuário">
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