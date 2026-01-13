// frontend/src/components/MyProfile.tsx

import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface MyProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

// --- SUB-COMPONENTE: Modal de Confirmação de Segurança ---
const SecurityConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <i className="fa-solid fa-shield-halved text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmação de Segurança</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Você está prestes a alterar seus dados de acesso. <br/>
                        Deseja realmente aplicar essas mudanças?
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors">
                            Sim, Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MyProfile: React.FC<MyProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado do modal

  // 1. Validação inicial (Botão do Formulário)
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica de senha
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    // Se passou na validação, abre o modal de confirmação
    setShowConfirmModal(true);
  };

  // 2. Ação real de salvar (Botão "Sim" do Modal)
  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      const payload: any = { name: formData.name };
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await api.put(`/users/${user.id}`, payload);
      
      onUpdateUser({ ...user, name: formData.name });
      
      toast.success("Perfil atualizado com sucesso!");
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); 
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erro ao atualizar perfil.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* Modal de Confirmação */}
      <SecurityConfirmModal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        onConfirm={handleConfirmSave} 
      />

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
        <i className="fa-solid fa-id-card absolute -right-6 -bottom-6 text-[180px] opacity-10 rotate-12"></i>
      </div>

      {/* Formulário de Edição */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <i className="fa-solid fa-user-gear text-gray-400 text-xl"></i>
            <h3 className="text-xl font-bold text-gray-800">Dados Pessoais & Segurança</h3>
        </div>

        {/* Note que o onSubmit chama o handlePreSubmit (Validação), não o save direto */}
        <form onSubmit={handlePreSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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