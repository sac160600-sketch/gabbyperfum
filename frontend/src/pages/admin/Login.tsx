import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user.role !== 'Admin') {
        setError('Acceso denegado. Solo administradores.');
        return;
      }
      localStorage.setItem('ayra_token', data.token);
      localStorage.setItem('ayra_user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de inicio de sesión');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-gray-100">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-widest text-[#d4af37] mb-2">GABBYPERFUM</h1>
          <p className="text-gray-400">Panel de Administración</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="admin@ayra.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-black font-medium py-3 rounded-lg transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
