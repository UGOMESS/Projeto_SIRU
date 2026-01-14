import React, { useState, useEffect } from 'react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isEditing?: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ 
  isOpen, onClose, onSubmit, formData, setFormData, isEditing 
}) => {
  // Estados para controle de visibilidade de senha
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Resetar estados internos ao abrir/fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setConfirmPassword('');
      setError('');
      setShowPass(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  // Validação de coincidência de senhas em tempo real
  useEffect(() => {
    if (isEditing && formData.password && confirmPassword && formData.password !== confirmPassword) {
      setError('As novas senhas não coincidem');
    } else {
      setError('');
    }
  }, [formData.password, confirmPassword, isEditing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        
        {/* CABEÇALHO COM IDENTIDADE VISUAL DISTINTA */}
        <div className={`p-6 flex justify-between items-center ${isEditing ? 'bg-indigo-700' : 'bg-blue-600'}`}>
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className={`fa-solid ${isEditing ? 'fa-user-pen' : 'fa-user-plus'} text-xl`}></i>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">{isEditing ? 'Editar Perfil' : 'Novo Usuário'}</h3>
              <p className="text-[10px] uppercase opacity-70 tracking-tighter mt-1">Gestão de Acessos SIRU</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* INFORMAÇÕES BÁSICAS */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nome Completo</label>
              <input 
                required 
                className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-medium" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">E-mail (Login)</label>
              <input 
                required 
                type="email" 
                className="w-full p-2.5 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-medium" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          {/* SEÇÃO DE SEGURANÇA / SENHA */}
          <div className={`p-4 rounded-xl border-2 ${isEditing ? 'bg-indigo-50/30 border-indigo-50' : 'bg-gray-50 border-gray-50'}`}>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved"></i> 
              {isEditing ? 'Redefinir Senha' : 'Senha de Acesso'}
            </h4>
            
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">
                  {isEditing ? 'Nova Senha' : 'Senha Inicial'}
                </label>
                <input 
                  required={!isEditing} 
                  type={showPass ? "text" : "password"} 
                  placeholder={isEditing ? "Deixe vazio para manter atual" : "Mínimo 6 caracteres"}
                  className="w-full p-2.5 pr-10 border-2 border-white rounded-lg focus:border-indigo-500 outline-none shadow-sm transition-all" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-indigo-600"
                >
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              {isEditing && (
                <div className="relative animate-slide-down">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Confirmar Nova Senha</label>
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    className={`w-full p-2.5 pr-10 border-2 rounded-lg outline-none shadow-sm transition-all ${error ? 'border-red-300' : 'border-white focus:border-indigo-500'}`} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-indigo-600"
                  >
                    <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                  {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{error}</p>}
                </div>
              )}
            </div>
          </div>

          {/* NÍVEL DE ACESSO */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Nível de Acesso</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'RESEARCHER'})}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.role === 'RESEARCHER' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
              >
                PESQUISADOR
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'ADMIN'})}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.role === 'ADMIN' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
              >
                ADMINISTRADOR
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancelar</button>
            <button 
              type="submit" 
              disabled={!!error}
              className={`px-6 py-2 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2 ${error ? 'bg-gray-300 cursor-not-allowed' : (isEditing ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')}`}
            >
              <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-user-plus'}`}></i>
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};