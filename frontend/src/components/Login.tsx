// frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Chama a rota que criamos no backend
      const response = await api.post('/login', { email, password });
      
      const { user, token } = response.data;
      
      // Passa os dados para o App.tsx gerenciar
      onLoginSuccess(user, token);
      
    } catch (err: any) {
      console.error(err);
      setError('E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-unilab-blue">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-unilab-blue mb-2">SIRU</h1>
          <p className="text-gray-500">Sistema Integrado de Reagentes da Unilab</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-unilab-blue focus:border-transparent outline-none transition-all"
              placeholder="seu.nome@unilab.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-unilab-blue focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-unilab-blue text-white font-bold rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-unilab-blue ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i> Entrando...
              </span>
            ) : (
              'Acessar Sistema'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 Engenharia de Computação - Unilab</p>
        </div>
      </div>
    </div>
  );
};