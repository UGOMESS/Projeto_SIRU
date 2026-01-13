// frontend/src/components/MyProfile.tsx

import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface MyProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validação básica de senha
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        setIsLoading(false);
        return;
    }

    try {
      // Prepara o payload (só envia senha se o usuário digitou algo)
      const payload: any = { name: formData.name };
      if (formData.password) {
        payload.password = formData.password;
      }

      // Chama a API (Assumindo rota PUT /users/:id)
      const response = await api.put(`/users/${user.id}`, payload);
      
      // Atualiza o estado global no App.tsx
      onUpdateUser({ ...user, name: formData.name });
      
      toast.success("Perfil atualizado com sucesso!");
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Limpa campos de senha
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erro ao atualizar perfil.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* Cartão de Identificação Visual */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg border-4 border-blue-200">
                {user.name.charAt(0).toUpperCase()}
            </div>
        </div>
        <div className="text-center md:text-left relative z-10">
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-blue-100 opacity-90">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30">
                {user.role === 'ADMIN' ? 'Administrador' : 'Pesquisador'}
            </span>
        </div>
        
        {/* Elemento decorativo de fundo */}
        <i className="fa-solid fa-id-card absolute -right-6 -bottom-6 text-[180px] opacity-10 rotate-12"></i>
      </div>

      {/* Formulário de Edição */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <i className="fa-solid fa-user-gear text-gray-400 text-xl"></i>
            <h3 className="text-xl font-bold text-gray-800">Dados Pessoais & Segurança</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nome */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                    <div className="relative">
                        <i className="fa-solid fa-user absolute left-3 top-3 text-gray-400"></i>
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail (Não editável)</label>
                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3 top-3 text-gray-400"></i>
                        <input 
                            type="email" 
                            disabled
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                            value={formData.email}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-lock text-orange-500"></i> Alterar Senha
                </h4>
                <p className="text-xs text-gray-400 mb-4">Deixe os campos em branco se não quiser alterar sua senha.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Senha</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Repita a nova senha"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                    Salvar Alterações
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};