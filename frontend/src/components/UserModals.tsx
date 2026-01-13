import React from 'react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit, formData, setFormData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-xl text-gray-800">Novo Usuário/Pesquisador</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
            <input required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail (Login)</label>
            <input required type="email" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha Inicial</label>
              <input required type="password" title="Mínimo 6 caracteres" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nível de Acesso</label>
              <select className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="RESEARCHER">Pesquisador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md active:scale-95 transition-all">
              Cadastrar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};